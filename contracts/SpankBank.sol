pragma solidity 0.4.24;
import {SafeMath} from "./SafeMath.sol";
import {HumanStandardToken} from "./HumanStandardToken.sol";
import {MintAndBurnToken} from "./MintAndBurnToken.sol";
import "./BytesLib.sol";

contract SpankBank {
    using BytesLib for bytes;
    using SafeMath for uint256;

    event SpankBankCreated(
        uint256 periodLength,
        uint256 maxPeriods,
        address spankAddress,
        uint256 initialBootySupply,
        string bootyTokenName,
        uint8 bootyDecimalUnits,
        string bootySymbol
    );

    event StakeEvent(
        address indexed staker,
        uint256 period,
        uint256 spankPoints,
        uint256 spankAmount,
        uint256 stakePeriods
    );
        // TODO: Do we want delegateKey and bootyBase in here? Probably?

    event PeriodEvent(
        uint256 period,
        uint256 bootyFees,
        uint256 totalSpankPoints,
        uint256 bootyMinted,
        uint256 closingVotes,
        uint256 totalStakedSpank
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
        address indexed staker,
        uint256 period,
        uint256 spankPoints,
        uint256 stakerEndingPeriod
    );

    event ClaimBootyEvent (
        address indexed staker,
        uint256 indexed period,
        uint256 indexed bootyOwed
    );
        // TODO: Do these need to be indexed? Where would that be used?  (in
        // fact, with chainsaw, nothing needs to be indexed, since we do
        // that... unless, ex, the browser's web3 is going to be making
        // queries)

    event WithdrawStakeEvent (
        address indexed staker,
        uint256 indexed totalSpankToWithdraw
    );

    event SplitStakeEvent (
        address indexed staker,
        address indexed newAddress,
        uint256 spankAmount
    );
        // TODO: Do we want delegateKey and bootyBase in here? Probably?

    event VoteToCloseEvent (
        address indexed staker,
        uint256 period
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

        emit SpankBankCreated(_periodLength, _maxPeriods, spankAddress, initialBootySupply, bootyTokenName, bootyDecimalUnits, bootySymbol);
    }

    // Used to create a new staking position - verifies that the caller is not staking
    function stake(uint256 spankAmount, uint256 stakePeriods, address delegateKey, address bootyBase) SpankBankIsOpen public {
        doStake(msg.sender, spankAmount, stakePeriods, delegateKey, bootyBase);
    }

    function doStake(address stakerAddress, uint256 spankAmount, uint256 stakePeriods, address delegateKey, address bootyBase) internal {
        updatePeriod();
        require(stakePeriods > 0 && stakePeriods <= maxPeriods, "stake:: stake must be between 0 and maxPeriods"); // stake 1-12 (max) periods
        require(spankAmount > 0, "stake::spankAmount must be greater than 0"); // stake must be greater than 0

        // the msg.sender must not have an active staking position
        // TODO checking that endingPeriod == 0 should cover all periods
        require(stakers[stakerAddress].startingPeriod == 0 && stakers[stakerAddress].endingPeriod == 0, "stake::startingPeriod and endingPeriod must be 0");

        // transfer SPANK to this contract - assumes sender has already "allowed" the spankAmount
        require(spankToken.transferFrom(stakerAddress, this, spankAmount),"stake::spankToken transfer failure");

        stakers[stakerAddress] = Staker(spankAmount, currentPeriod + 1, currentPeriod + stakePeriods, delegateKey, bootyBase);

        _calculateNextPeriodPoints(stakerAddress, stakePeriods);

        totalSpankStaked = SafeMath.add(totalSpankStaked, spankAmount);

        require(delegateKey != address(0));
        require(bootyBase != address(0));
        require(stakerByDelegateKey[delegateKey] == address(0));
        stakerByDelegateKey[delegateKey] = stakerAddress;

        emit StakeEvent(
            stakerAddress,
            currentPeriod + 1,
            stakers[stakerAddress].spankPoints[currentPeriod + 1],
            spankAmount,
            stakePeriods
        );
    }

    function _calculateNextPeriodPoints(address stakerAddress, uint256 stakingPeriods) internal {
        Staker storage staker = stakers[stakerAddress];
        uint256 nextSpankPoints = SafeMath.div(SafeMath.mul(staker.spankStaked, pointsTable[stakingPeriods]), 100);
        uint256 stakerNextPeriodSpankPoints = staker.spankPoints[currentPeriod + 1];

        if (stakerNextPeriodSpankPoints == 0) {
            uint256 nextTotalSpankPoints = periods[currentPeriod + 1].totalSpankPoints;
            nextTotalSpankPoints = SafeMath.add(nextTotalSpankPoints, nextSpankPoints);
            periods[currentPeriod + 1].totalSpankPoints = nextTotalSpankPoints;
        }

        staker.spankPoints[currentPeriod + 1] = nextSpankPoints;

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
            emit PeriodEvent(
                currentPeriod,
                prevPeriod.bootyFees,
                prevPeriod.totalSpankPoints,
                prevPeriod.bootyMinted,
                prevPeriod.closingVotes,
                prevPeriod.totalStakedSpank
            );

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

        require(currentPeriod < staker.endingPeriod);

        if (updatedEndingPeriod > 0) {
            // TODO I'm not sure we can rely on the staker.endingPeriod to be greater than the
            // currentPeriod - what if the staker expires but never withdraws their stake?
            require(updatedEndingPeriod > currentPeriod, "checkIn::updatedEndingPeriod must be greater than currentPeriod");
            require(updatedEndingPeriod > staker.endingPeriod, "checkIn::updatedEndingPeriod must be greater than staker.endingPeriod");
            require(updatedEndingPeriod <= currentPeriod + maxPeriods, "updatedEndingPeriod must be less than or equal to currentPeriod + maxPeriods");
            require(staker.spankPoints[currentPeriod+1] == 0);

            staker.endingPeriod = updatedEndingPeriod;
        }

        uint256 stakePeriods = staker.endingPeriod - currentPeriod;

        _calculateNextPeriodPoints(stakerAddress, stakePeriods);

        emit CheckInEvent(stakerAddress, currentPeriod + 1, staker.spankPoints[currentPeriod + 1], staker.endingPeriod);
    }

    function claimBooty(uint256 _period) public {
        updatePeriod();

        require(_period < currentPeriod, "claimBooty::_period must be less than currentPeriod"); // can only claim booty for previous periods

        address stakerAddress = stakerByDelegateKey[msg.sender];

        Staker storage staker = stakers[stakerAddress];

        require(!staker.didClaimBooty[_period], "claimBooty::didClaimBooty for period must be false"); // can only claim booty once

        staker.didClaimBooty[_period] = true;

        Period memory period = periods[_period];
        require(period.mintingComplete);
        
        uint256 bootyMinted = period.bootyMinted;
        uint256 totalSpankPoints = period.totalSpankPoints;

        if (totalSpankPoints > 0) {
            uint256 stakerSpankPoints = staker.spankPoints[_period];
            uint256 bootyOwed = SafeMath.div(SafeMath.mul(stakerSpankPoints, bootyMinted), totalSpankPoints);

            require(bootyToken.transfer(staker.bootyBase, bootyOwed), "claimBooty::bootyToken transfer failure");

            emit ClaimBootyEvent(stakerAddress, _period, bootyOwed);
        }
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

        emit VoteToCloseEvent(msg.sender, currentPeriod);
    }

    function updateDelegateKey(address newDelegateKey) public {
        require (newDelegateKey != address(0));
        require (stakerByDelegateKey[newDelegateKey] == address(0));

        Staker storage staker = stakers[msg.sender];
        require (staker.delegateKey != address(0));
        staker.delegateKey = newDelegateKey;
        
        stakerByDelegateKey[staker.delegateKey] = address(0);

        stakerByDelegateKey[newDelegateKey] = msg.sender;

        emit UpdateDelegateKeyEvent(msg.sender);
    }

    function updateBootyBase(address newBootyBase) public {
        Staker storage staker = stakers[msg.sender];
        require (staker.spankStaked > 0);

        staker.bootyBase = newBootyBase;

        emit UpdateBootyBaseEvent(msg.sender);
    }

    // TODO as-is, the contract doesnt allow for dynamic stake allocation - you can only extend
    // the entire stake, or withdraw the entire stake. Even if you could withdraw partial stake,
    // you would still be making the decision to extend the entire stake, or not.
    // - allow staker to split stake (or move some fraction under a new address)
    // - accept that you have to extend the entire stake, and plan ahead accordingly
    //   - split the stake up into several portions, and decide to extend / not each portion

    function getSpankPoints(address stakerAddress, uint256 period) public view returns (uint256)  {
        return stakers[stakerAddress].spankPoints[period];
    }

    function getDidClaimBooty(address stakerAddress, uint256 period) public view returns (bool)  {
        return stakers[stakerAddress].didClaimBooty[period];
    }

    function getVote(address stakerAddress, uint period) public view returns (bool) {
        return stakers[stakerAddress].votedToClose[period];
    }

    function getStakerFromDelegateKey(address delegateAddress) public view returns (address) {
        return stakerByDelegateKey[delegateAddress];
    }

}
