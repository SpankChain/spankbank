// TODO closingVotes is defined on period but never used
// - should be removed globally -> only use period votes

pragma solidity 0.4.24;
import {SafeMath} from "./SafeMath.sol";
import {HumanStandardToken} from "./HumanStandardToken.sol";
import {MintAndBurnToken} from "./MintAndBurnToken.sol";
import "./BytesLib.sol";

contract SpankBank {
    using BytesLib for bytes;
    using SafeMath for uint256;

    event StakeEvent(
        address indexed staker
    );

    event SendFeesEvent (
        address indexed sender,
        uint256 indexed bootyAmount
    );

    event MintBootyEvent (
        uint256 indexed targetBootySupply,
        uint256 indexed totalBootySupply
    );

    event CheckInEvent (
        address indexed staker
    );

    event ClaimBootyEvent (
        address indexed staker,
        uint256 indexed period,
        uint256 indexed bootyOwed
    );

    event WithdrawStakeEvent (
        address indexed staker,
        uint256 indexed totalSpankToWithdraw
    );

    event SplitStakeEvent (
        address indexed staker,
        address indexed newAddress,
        uint spankAmount
    );

    event VoteToCloseEvent (
        address indexed staker
    );

    event UpdateDelegateKeyEvent (
        address indexed staker
    );

    event UpdateBootyBaseEvent (
        address indexed staker
    );

    event ReceiveApprovalEvent (
        address from,
        address tokenContract,
        bytes extraData
    );

    /***********************************
    VARIABLES SET AT CONTRACT DEPLOYMENT
    ************************************/
    // GLOBAL CONSTANT VARIABLES
    uint256 public periodLength; // time length of each period in seconds
    uint256 public maxPeriods;
    uint256 public totalSpankStaked;
    bool public isClosed;
    uint256 public closingVotes;
    uint256 public closingPeriod;

    // ERC-20 BASED TOKEN WITH SOME ADDED PROPERTIES FOR HUMAN READABILITY
    // https://github.com/ConsenSys/Tokens/blob/master/contracts/HumanStandardToken.sol
    HumanStandardToken public spankToken;
    MintAndBurnToken public bootyToken;

    // LOOKUP TABLE FOR SPANKPOINTS BY PERIOD
    // 1 -> 45%
    // 2 -> 50%
    // ...
    // 12 -> 100%
    mapping(uint256 => uint256) pointsTable;

    /*************************************
    INTERAL ACCOUNTING
    **************************************/
    uint256 public currentPeriod = 0;

    struct Staker {
        uint256 spankStaked; // the amount of spank staked
        uint256 startingPeriod; // the period this staker started staking
        uint256 endingPeriod; // the period after which this stake expires
        mapping(uint256 => uint256) spankPoints; // the spankPoints per period
        mapping(uint256 => bool) didClaimBooty; // true if staker claimed BOOTY for that period
        mapping(uint256 => bool) votedToClose; // true if voter voted
        address delegateKey;
        address bootyBase;
    }

    mapping(address => Staker) public stakers;

    struct Period {
        uint256 bootyFees; // the amount of BOOTY collected in fees
        uint256 totalSpankPoints; // the total spankPoints of all stakers
        uint256 bootyMinted; // the amount of BOOTY minted
        bool mintingComplete; // true if BOOTY has already been minted for this period
        uint256 startTime; // the starting unix timestamp in seconds
        uint256 endTime; // the ending unix timestamp in seconds
        uint256 closingVotes; // the total votes to close this period
        uint256 totalStakedSpank; // the total SPANK staked
    }

    mapping(uint256 => Period) public periods;

    mapping(address => address) public stakerByDelegateKey;

    modifier SpankBankIsOpen() {
        require(isClosed == false);
        _;
    }

    constructor (
        uint256 _periodLength,
        uint256 _maxPeriods,
        address spankAddress,
        uint256 initialBootySupply,
        string bootyTokenName,
        uint8 bootyDecimalUnits,
        string bootySymbol
    )   public {
        periodLength = _periodLength;
        maxPeriods = _maxPeriods;
        spankToken = HumanStandardToken(spankAddress);
        bootyToken = new MintAndBurnToken(bootyTokenName, bootyDecimalUnits, bootySymbol);
        bootyToken.mint(this, initialBootySupply);

        uint256 startTime = now;

        periods[currentPeriod].startTime = startTime;
        periods[currentPeriod].endTime = SafeMath.add(startTime, periodLength);

        bootyToken.transfer(msg.sender, initialBootySupply);

        // initialize points table
        pointsTable[0] = 0;
        pointsTable[1] = 45;
        pointsTable[2] = 50;
        pointsTable[3] = 55;
        pointsTable[4] = 60;
        pointsTable[5] = 65;
        pointsTable[6] = 70;
        pointsTable[7] = 75;
        pointsTable[8] = 80;
        pointsTable[9] = 85;
        pointsTable[10] = 90;
        pointsTable[11] = 95;
        pointsTable[12] = 100;
    }

    // Used to create a new staking position - verifies that the caller is not staking
    function stake(uint256 spankAmount, uint256 stakePeriods, address delegateKey, address bootyBase) SpankBankIsOpen public {
        doStake(msg.sender, spankAmount, stakePeriods, delegateKey, bootyBase);
    }

    function doStake(address stakerAddress, uint256 spankAmount, uint256 stakePeriods, address delegateKey, address bootyBase) internal {
        updatePeriod();
        require(stakePeriods > 0 && stakePeriods <= maxPeriods, "stake:: stake must be between 0 and maxPeriods"); // stake 1-12 (max) periods
        require(spankAmount > 0, "stake::spankAmount must be greater than 0"); // stake must be greater than 0

        // the staker must not have an active staking position
        require(stakers[stakerAddress].startingPeriod == 0 && stakers[stakerAddress].endingPeriod == 0, "stake::startingPeriod and endingPeriod must be 0");

        // transfer SPANK to this contract - assumes sender has already "allowed" the spankAmount
        require(spankToken.transferFrom(stakerAddress, this, spankAmount),"stake::spankToken transfer failure");

        stakers[stakerAddress] = Staker(spankAmount, currentPeriod + 1, currentPeriod + stakePeriods, delegateKey, bootyBase);

        _updateNextPeriodPoints(stakerAddress, stakePeriods);

        totalSpankStaked = SafeMath.add(totalSpankStaked, spankAmount);

        require(delegateKey != address(0));
        require(bootyBase != address(0));
        require(stakerByDelegateKey[delegateKey] == address(0));
        stakerByDelegateKey[delegateKey] = stakerAddress;

        emit StakeEvent(stakerAddress);
    }

    // Called during stake and checkIn, assumes those functions prevent duplicate calls
    // for the same staker.
    function _updateNextPeriodPoints(address stakerAddress, uint256 stakingPeriods) internal {
        Staker storage staker = stakers[stakerAddress];

        uint256 stakerPoints = SafeMath.div(SafeMath.mul(staker.spankStaked, pointsTable[stakingPeriods]), 100);

        // add staker spankpoints to total spankpoints for the next period
        uint256 totalPoints = periods[currentPeriod + 1].totalSpankPoints;
        totalPoints = SafeMath.add(totalPoints, stakerPoints);
        periods[currentPeriod + 1].totalSpankPoints = totalPoints;

        staker.spankPoints[currentPeriod + 1] = stakerPoints;

        // TODO decide what to do about period.totalStakedSpank
        // probably force users to checkIn in order to vote to close?
        Period storage period = periods[currentPeriod];
        period.totalStakedSpank = SafeMath.add(period.totalStakedSpank, staker.spankStaked);
    }

    function receiveApproval(address from, uint256 amount, address tokenContract, bytes extraData) SpankBankIsOpen public returns (bool success) {
        address delegateKeyFromBytes = extraData.toAddress(12);
        address bootyBaseFromBytes = extraData.toAddress(44);
        uint256 periodFromBytes = extraData.toUint(64);

        emit ReceiveApprovalEvent(from, tokenContract, extraData);

        doStake(from, amount, periodFromBytes, delegateKeyFromBytes, bootyBaseFromBytes);
        return true;
    }

    // user will be able to add more SPANK to their stake and / or extend it
    // function updateStake(uint256 amount, uint256 periods) {}

    // 1. Anyone calls the mint function, which generates all the new booty for that period
    //  - what if no one calls mint? the booty supply will be lower for the next round
    //  - more booty will be created later to compensate (not really a bid deal)
    // 2. Stakers can withdraw their minted BOOTY

    // Do the fees get calculated for the current period or the next one? Current
    // Does the minting depends on current stake or next?
    // If I start staking at 10.5, my stake will only matter for 11, and the BOOTY generated after 11 will be based on the fees paid during 11, and can only be collected after 11 is done

    function sendFees(uint256 bootyAmount) SpankBankIsOpen public {
        updatePeriod();

        require(bootyAmount > 0, "sendFees::fees must be greater than 0"); // fees must be greater than 0
        require(bootyToken.transferFrom(msg.sender, this, bootyAmount), "sendFees::bootyToken transfer failed");

        bootyToken.burn(bootyAmount);

        uint256 currentBootyFees = periods[currentPeriod].bootyFees;
        currentBootyFees = SafeMath.add(bootyAmount, currentBootyFees);
        periods[currentPeriod].bootyFees = currentBootyFees;

        emit SendFeesEvent(msg.sender, bootyAmount);
    }

    function mintBooty() SpankBankIsOpen public {
        updatePeriod();

        // can't mint BOOTY during period 0 - would result in integer underflow
        require(currentPeriod > 0);

        Period storage period = periods[currentPeriod - 1];
        require(!period.mintingComplete, "mintBooty::mintingComplete must be false"); // cant mint BOOTY twice

        period.mintingComplete = true;

        uint256 targetBootySupply = SafeMath.mul(period.bootyFees, 20);
        uint256 totalBootySupply = bootyToken.totalSupply();

        if (targetBootySupply > totalBootySupply) {
            uint256 bootyMinted = targetBootySupply - totalBootySupply;
            bootyToken.mint(this, bootyMinted);
            period.bootyMinted = bootyMinted;
            emit MintBootyEvent(targetBootySupply, totalBootySupply);
        }
    }

    // This will check the current time and update the current period accordingly
    // - called from all write functions to ensure the period is always up to date before any writes
    // - can also be called externally, but there isn't a good reason for why you would want to
    // - the while loop protects against the edge case where we miss a period

    function updatePeriod() public {
        while (now >= periods[currentPeriod].endTime) {
            Period memory prevPeriod = periods[currentPeriod];
            currentPeriod += 1;
            periods[currentPeriod].startTime = prevPeriod.endTime;
            periods[currentPeriod].endTime = SafeMath.add(prevPeriod.endTime, periodLength);
        }
    }

    // In order to receive Booty, each staker will have to check-in every period.
    // This check-in will compute the spankPoints locally and globally for each staker.
    function checkIn(uint256 updatedEndingPeriod) SpankBankIsOpen public {
        updatePeriod();

        address stakerAddress =  stakerByDelegateKey[msg.sender];

        Staker storage staker = stakers[stakerAddress];

        require(currentPeriod < staker.endingPeriod, "checkIn::staker must not have expired");

        require(staker.spankPoints[currentPeriod+1] == 0, "checkIn::staker.spankPoints[nextPeriod] must be 0");

        // If updatedEndingPeriod is 0, don't update the ending period
        if (updatedEndingPeriod > 0) {
            require(updatedEndingPeriod > staker.endingPeriod, "checkIn::updatedEndingPeriod must be greater than staker.endingPeriod");
            require(updatedEndingPeriod <= currentPeriod + maxPeriods, "checkIn::updatedEndingPeriod must be less than or equal to currentPeriod + maxPeriods");
            staker.endingPeriod = updatedEndingPeriod;
        }

        uint256 stakePeriods = staker.endingPeriod - currentPeriod;

        _updateNextPeriodPoints(stakerAddress, stakePeriods);

        emit CheckInEvent(stakerAddress);
    }

    function claimBooty(uint256 claimPeriod) public {
        updatePeriod();

        Period memory period = periods[claimPeriod];
        require(period.mintingComplete, "claimBooty:: booty has not been minted for the claim period");

        address stakerAddress = stakerByDelegateKey[msg.sender];

        Staker storage staker = stakers[stakerAddress];

        require(!staker.didClaimBooty[claimPeriod], "claimBooty::didClaimBooty for period must be false"); // can only claim booty once

        uint256 stakerSpankPoints = staker.spankPoints[claimPeriod];
        require(stakerSpankPoints > 0); // only stakers can claim

        staker.didClaimBooty[claimPeriod] = true;

        uint256 bootyMinted = period.bootyMinted;
        uint256 totalSpankPoints = period.totalSpankPoints;

        uint256 bootyOwed = SafeMath.div(SafeMath.mul(stakerSpankPoints, bootyMinted), totalSpankPoints);

        require(bootyToken.transfer(staker.bootyBase, bootyOwed), "claimBooty::bootyToken transfer failure");

        emit ClaimBootyEvent(stakerAddress, claimPeriod, bootyOwed);
    }

    function withdrawStake() public {
        updatePeriod();

        Staker storage staker = stakers[msg.sender];

        if (isClosed) {
            staker.endingPeriod = SafeMath.sub(currentPeriod, 1);
        }

        require(currentPeriod > staker.endingPeriod, "withdrawStake::currentPeriod must be greater than staker.endingPeriod");

        spankToken.transfer(msg.sender, staker.spankStaked);

        uint256 totalSpankToWithdraw = staker.spankStaked;

        totalSpankStaked = SafeMath.sub(totalSpankStaked, staker.spankStaked);
        staker.spankStaked = 0;

        emit WithdrawStakeEvent(msg.sender, totalSpankToWithdraw);
    }

    function splitStake(address newAddress, address newDelegateKey, address newBootyBase, uint256 spankAmount) public {
        updatePeriod();

        require(newAddress != address(0), "splitStake::newAddress must be a non-zero address");
        require(newDelegateKey != address(0), "splitStake::delegateKey must be a non-zero address");
        require(newBootyBase != address(0), "splitStake::bootyBase must be a non-zero address");
        require(stakerByDelegateKey[newDelegateKey] == address(0), "splitStake::delegateKey must not be in use");

        require(spankAmount > 0, "splitStake::spankAmount must be greater than 0");

        Staker storage staker = stakers[msg.sender];
        require(currentPeriod < staker.endingPeriod, "currentPeriod must be less than staker endingPeriod");
        require(spankAmount <= staker.spankStaked, "spankAmount must be less than or equal to staker stake");
        require(staker.spankPoints[currentPeriod+1] == 0);

        staker.spankStaked = SafeMath.sub(staker.spankStaked, spankAmount);

        stakers[newAddress] = Staker(spankAmount, staker.startingPeriod, staker.endingPeriod, newDelegateKey, newBootyBase);

        stakerByDelegateKey[newDelegateKey] = newAddress;

        emit SplitStakeEvent(msg.sender, newAddress, spankAmount);
    }

    function voteToClose() public {
        updatePeriod();

        Staker storage staker = stakers[msg.sender];
        require(staker.spankStaked > 0, "stake must be greater than zero");
        require(staker.endingPeriod >= currentPeriod, "endingPeriod must be greater than or equal to currentPeriod");
        require (staker.votedToClose[currentPeriod] == false);
        require(isClosed == false);

        if (closingPeriod != currentPeriod) {
            closingPeriod = currentPeriod;
            closingVotes = 0;
        }
        closingVotes = SafeMath.add(closingVotes, staker.spankStaked);
        staker.votedToClose[currentPeriod] = true;

        uint256 closingTrigger = SafeMath.div(totalSpankStaked, 2);
        if (closingVotes > closingTrigger) {
            isClosed = true;
        }

        emit VoteToCloseEvent(msg.sender);
    }

    function updateDelegateKey(address newDelegateKey) public {
        require(newDelegateKey != address(0));
        require(stakerByDelegateKey[newDelegateKey] == address(0));

        Staker storage staker = stakers[msg.sender];
        require(staker.delegateKey != address(0), "updateDelegateKey::must have a delegateKey to update delegateKey");

        stakerByDelegateKey[staker.delegateKey] = address(0);
        staker.delegateKey = newDelegateKey;
        stakerByDelegateKey[newDelegateKey] = msg.sender;

        emit UpdateDelegateKeyEvent(msg.sender);
    }

    function updateBootyBase(address newBootyBase) public {
        Staker storage staker = stakers[msg.sender];
        require(staker.spankStaked > 0);

        staker.bootyBase = newBootyBase;

        emit UpdateBootyBaseEvent(msg.sender);
    }

    function getSpankPoints(address stakerAddress, uint256 period) public view returns (uint256)  {
        return stakers[stakerAddress].spankPoints[period];
    }

    function getDidClaimBooty(address stakerAddress, uint256 period) public view returns (bool)  {
        return stakers[stakerAddress].didClaimBooty[period];
    }

    function getVote(address stakerAddress, uint period) public view returns (bool) {
        return stakers[stakerAddress].votedToClose[period];
    }

    function getPeriod(uint256 period) public view returns (uint256, uint256, uint256, bool, uint256, uint256) {
        return (periods[period].bootyFees, periods[period].totalSpankPoints, periods[period].bootyMinted, periods[period].mintingComplete, periods[period].startTime, periods[period].endTime);
    }

    function getStaker(address stakerAddress) public view returns (uint256, uint256, uint256, address, address) {
        Staker memory staker = stakers[stakerAddress];
        return (staker.spankStaked, staker.startingPeriod, staker.endingPeriod, staker.delegateKey, staker.bootyBase);
    }

    function getStakerFromDelegateKey(address delegateAddress) public view returns (address) {
        return stakerByDelegateKey[delegateAddress];
    }
}
