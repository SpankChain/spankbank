pragma solidity 0.4.24;
import {SafeMath} from "./SafeMath.sol";
import {HumanStandardToken} from "./HumanStandardToken.sol";
import {MintAndBurnToken} from "./MintAndBurnToken.sol";
import "./BytesLib.sol";
import {SpankLib as Spank} from "./SpankLib.sol";

contract SpankBank {
    using BytesLib for bytes;
    using SafeMath for uint256;
    using Spank for Spank.Stakes;

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
        bytes32 stakeId,
        address staker,
        uint256 period,
        uint256 spankPoints,
        uint256 spankAmount,
        uint256 stakePeriods,
        address delegateKey,
        address bootyBase
    );

    event SendFeesEvent (
        address sender,
        uint256 bootyAmount
    );

    event MintBootyEvent (
        uint256 targetBootySupply,
        uint256 totalBootySupply
    );

    event CheckInEvent (
        address staker,
        bytes32 stakeId,
        uint256 period,
        uint256 spankPoints,
        uint256 stakeEndingPeriod
    );

    event ClaimBootyEvent (
        address staker,
        uint256 period,
        uint256 bootyOwed
    );

    event WithdrawStakeEvent (
        address staker,
        uint256 totalSpankToWithdraw
    );

    event SplitStakeEvent (
        address staker,
        address newAddress,
        address newDelegateKey,
        address newBootyBase,
        uint256 spankAmount
    );

    event VoteToCloseEvent (
        address staker,
        uint256 period
    );

    event UpdateDelegateKeyEvent (
        address staker,
        address newDelegateKey
    );

    event UpdateBootyBaseEvent (
        address staker,
        address newBootyBase
    );

    event ReceiveApprovalEvent (
        address from,
        address tokenContract
    );

    /***********************************
    VARIABLES SET AT CONTRACT DEPLOYMENT
    ************************************/
    // GLOBAL CONSTANT VARIABLES
    uint256 public periodLength; // time length of each period in seconds
    uint256 public maxPeriods; // the maximum # of periods a staker can stake for
    uint256 public totalSpankStaked; // the total SPANK staked across all stakers
    bool public isClosed; // true if voteToClose has passed, allows early withdrawals

    // ERC-20 BASED TOKEN WITH SOME ADDED PROPERTIES FOR HUMAN READABILITY
    // https://github.com/ConsenSys/Tokens/blob/master/contracts/HumanStandardToken.sol
    HumanStandardToken public spankToken;
    MintAndBurnToken public bootyToken;

    // LOOKUP TABLE FOR SPANKPOINTS BY PERIOD
    // 1 -> 45%
    // 2 -> 50%
    // ...
    // 12 -> 100%
    mapping(uint256 => uint256) public pointsTable;

    /*************************************
    INTERAL ACCOUNTING
    **************************************/
    uint256 public currentPeriod = 0;

    mapping(bytes32 => Spank.Stake) public stakes;
    mapping(address => Spank.Staker) public stakers;
    mapping(uint256 => Spank.Period) public periods;
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

    /**
     * @dev Creates a new staking position for the msg.sender. If this is the first stake for this address being created, the staker is
     * automatically registered using the provided delegateKey and bootyBase parameters. On the other hand, if the msg.sender is
     * a known staker, these parameters are optional.
     * Reverts if
     * - stakePeriods is out of allowed range [1-maxPeriods]
     * - spankAmount is zero
     * - delegateKey is zero address (only for new staker address)
     * - bootyBase is zero address (only for new staker address)
     * - delegateKey is already used (only for new staker address)

     * @param spankAmount - amount of Spank to stake
     * @param stakePeriods - number of periods to stake initially
     * @param delegateKey - the address permitted to act as delegate of the calling Staker (optional, if staker already registered)
     * @param bootyBase - the address to which claimed booty is sent (optional, if staker already registered)
     */ 
    function stake(uint256 spankAmount, uint256 stakePeriods, address delegateKey, address bootyBase) SpankBankIsOpen public {
        return doStake(msg.sender, spankAmount, stakePeriods, delegateKey, bootyBase);
    }

    function doStake(address stakerAddress, uint256 spankAmount, uint256 stakePeriods, address delegateKey, address bootyBase) internal {
        require(stakePeriods > 0 && stakePeriods <= maxPeriods, "stake not between zero and maxPeriods"); // stake 1-12 (max) periods
        require(spankAmount > 0, "stake is 0"); // stake must be greater than 0

        updatePeriod();

        // transfer SPANK to this contract - assumes sender has already "allowed" the spankAmount
        require(spankToken.transferFrom(stakerAddress, this, spankAmount));

        // the new stake ID is generated from the staker address and the position index in the array of stakes
        // this will not cause any hash collisions as long as no stakes are deleted
        bytes32 stakeId = keccak256(abi.encodePacked(stakerAddress, stakers[stakerAddress].stakes.length));

        // a Staker cannot exist without at least one stake, so we use that to detect a new Staker to be created
        if (stakers[stakerAddress].stakes.length == 0) {
            require(delegateKey != address(0), "delegateKey does not exist");
            require(bootyBase != address(0), "bootyBase does not exist");
            require(stakerByDelegateKey[delegateKey] == address(0), "delegateKey already used");
            bytes32[] memory stakeIDs;
            stakers[stakerAddress] = Spank.Staker(0, delegateKey, bootyBase, stakeIDs); // initialize totalSpank as 0. spankAmount is added below
            stakerByDelegateKey[delegateKey] = stakerAddress;
        }

        stakers[stakerAddress].stakes.push(stakeId);
        stakers[stakerAddress].totalSpank = SafeMath.add(stakers[stakerAddress].totalSpank, spankAmount);
        stakes[stakeId] = Spank.Stake(stakerAddress, spankAmount, currentPeriod, currentPeriod + stakePeriods - 1, 0);

        _applyStakeToCurrentPeriod(stakerAddress, stakeId, stakePeriods);

        totalSpankStaked = SafeMath.add(totalSpankStaked, spankAmount);

        emit StakeEvent(
            stakeId,
            stakerAddress,
            currentPeriod,
            stakers[stakerAddress].spankPoints[currentPeriod],
            spankAmount,
            stakePeriods,
            delegateKey,
            bootyBase
        );

    }

    // Called during stake and checkIn, assumes those functions prevent duplicate calls
    // for the same staker.
    function _applyStakeToCurrentPeriod(address stakerAddress, bytes32 stakeId, uint256 stakePeriods) internal {
        Spank.Staker storage staker = stakers[stakerAddress];
        Spank.Stake storage stk = stakes[stakeId];

        uint256 stakerPoints = SafeMath.div(SafeMath.mul(stk.spankStaked, pointsTable[stakePeriods]), 100);

        // add staker spankpoints to total spankpoints for this period
        uint256 totalPoints = periods[currentPeriod].totalSpankPoints;
        totalPoints = SafeMath.add(totalPoints, stakerPoints);
        periods[currentPeriod].totalSpankPoints = totalPoints;

        staker.spankPoints[currentPeriod] = stakerPoints;
        stk.lastAppliedToPeriod = currentPeriod;
    }

    function receiveApproval(address from, uint256 amount, address tokenContract, bytes extraData) SpankBankIsOpen public returns (bool success) {
        require(msg.sender == address(spankToken), "invalid receiveApproval caller");

        address delegateKeyFromBytes = extraData.toAddress(12);
        address bootyBaseFromBytes = extraData.toAddress(44);
        uint256 periodFromBytes = extraData.toUint(64);

        emit ReceiveApprovalEvent(from, tokenContract);

        doStake(from, amount, periodFromBytes, delegateKeyFromBytes, bootyBaseFromBytes);
        return true;
    }

    function sendFees(uint256 bootyAmount) SpankBankIsOpen public {
        updatePeriod();

        require(bootyAmount > 0, "fee is zero"); // fees must be greater than 0
        require(bootyToken.transferFrom(msg.sender, this, bootyAmount));

        bootyToken.burn(bootyAmount);

        uint256 currentBootyFees = periods[currentPeriod].bootyFees;
        currentBootyFees = SafeMath.add(bootyAmount, currentBootyFees);
        periods[currentPeriod].bootyFees = currentBootyFees;

        emit SendFeesEvent(msg.sender, bootyAmount);
    }

    function mintBooty() SpankBankIsOpen public {
        updatePeriod();

        // can't mint BOOTY during period 0 - would result in integer underflow
        require(currentPeriod > 0, "current period is zero");

        Spank.Period storage period = periods[currentPeriod - 1];
        require(!period.mintingComplete, "minting already complete"); // cant mint BOOTY twice

        period.mintingComplete = true;

        uint256 targetBootySupply = SafeMath.mul(period.bootyFees, 20);
        uint256 totalBootySupply = bootyToken.totalSupply(); // TODO BOOTY v1 + v2

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
            Spank.Period memory prevPeriod = periods[currentPeriod];
            currentPeriod += 1;
            periods[currentPeriod].startTime = prevPeriod.endTime;
            periods[currentPeriod].endTime = SafeMath.add(prevPeriod.endTime, periodLength);
        }
    }

    /**
     * @dev In order to receive Booty, each staker will have to check-in every period.
     * This check-in will compute the spankPoints locally and globally for each staker.
     * Example: Staker has 5 stakes. Calling `checkIn([0,3], [38,0])` will perform a check-in
     * on stakes 1 and 4 with the ending period of stake 4 being set to period 38.
     *
     * @param stakeIds - an array of Stake IDs for which the staker would like to check in
     * @param updatedEndingPeriods - an array of updated ending periods matching the indexes of the stakeIds. A 0-value indicates no update for that stake.
     */
    function checkIn(bytes32[] stakeIds, uint256[] updatedEndingPeriods) SpankBankIsOpen public {
        updatePeriod();

        address stakerAddress =  stakerByDelegateKey[msg.sender];
        Spank.Staker storage staker = stakers[stakerAddress];

        for (uint256 i = 0; i < stakeIds.length; i++) {
            Spank.Stake storage stk = stakes[stakeIds[i]];
            require(stk.spankStaked > 0, "stake is zero"); // This can never occur for an existing stake as the stake() function requires the stakeAmount to be > 0, but for check-in it's used to verify the existence of the stake entry
            require(stk.owner == stakerAddress, "stake has different owner");
            require(currentPeriod <= stk.endingPeriod, "stake is expired");
            require(stk.lastAppliedToPeriod != currentPeriod, "cannot check-in twice for the same stake and period");
            // If updatedEndingPeriod is 0, don't update the ending period
            if (updatedEndingPeriods[i] > 0) {
                require(updatedEndingPeriods[i] > stk.endingPeriod, "updatedEndingPeriod less than or equal to stake endingPeriod");
                require(updatedEndingPeriods[i] < currentPeriod + maxPeriods, "updatedEndingPeriod greater than currentPeriod and maxPeriods");
                stk.endingPeriod = updatedEndingPeriods[i];
            }
            uint256 stakePeriods = stk.endingPeriod - currentPeriod;
            _applyStakeToCurrentPeriod(stakerAddress, stakeIds[i], stakePeriods);
            emit CheckInEvent(stakerAddress, stakeIds[i], currentPeriod, staker.spankPoints[currentPeriod], stk.endingPeriod);
        }
    }

    function claimBooty(uint256 claimPeriod) public {
        updatePeriod();

        Spank.Period memory period = periods[claimPeriod];
        require(period.mintingComplete, "booty not minted");

        address stakerAddress = stakerByDelegateKey[msg.sender];

        Spank.Staker storage staker = stakers[stakerAddress];

        require(!staker.didClaimBooty[claimPeriod], "staker already claimed"); // can only claim booty once // TODO isn't there a better way to claim all your accumulated booty?

        uint256 stakerSpankPoints = staker.spankPoints[claimPeriod];
        require(stakerSpankPoints > 0, "staker has no points"); // only stakers can claim

        staker.didClaimBooty[claimPeriod] = true;

        uint256 bootyMinted = period.bootyMinted;
        uint256 totalSpankPoints = period.totalSpankPoints;

        uint256 bootyOwed = SafeMath.div(SafeMath.mul(stakerSpankPoints, bootyMinted), totalSpankPoints);

        require(bootyToken.transfer(staker.bootyBase, bootyOwed));

        emit ClaimBootyEvent(stakerAddress, claimPeriod, bootyOwed);
    }

    function withdrawStake() public {
        updatePeriod();

        // TODO cannot withdraw stake until current period + 1
        // TODO we need a similar array as in checkIn() to specify which stakes are to be withdrawn

        Spank.Staker storage staker = stakers[msg.sender];
        require(staker.totalSpank > 0, "staker has no stake");

        // require(isClosed || currentPeriod > staker.endingPeriod, "currentPeriod less than endingPeriod or spankbank closed"); // TODO fix

        uint256 spankToWithdraw = staker.totalSpank;

        totalSpankStaked = SafeMath.sub(totalSpankStaked, staker.totalSpank);
        staker.totalSpank = 0;

        spankToken.transfer(msg.sender, spankToWithdraw);

        emit WithdrawStakeEvent(msg.sender, spankToWithdraw);
    }

    function splitStake(address newAddress, address newDelegateKey, address newBootyBase, uint256 spankAmount) public {
        updatePeriod();

        require(newAddress != address(0), "newAddress is zero");
        require(newDelegateKey != address(0), "delegateKey is zero");
        require(newBootyBase != address(0), "bootyBase is zero");
        require(stakerByDelegateKey[newDelegateKey] == address(0), "delegateKey in use");
        // require(stakers[newAddress].startingPeriod == 0, "staker already exists"); // TODO fix
        require(spankAmount > 0, "spankAmount is zero");

        Spank.Staker storage staker = stakers[msg.sender];
        // require(currentPeriod < staker.endingPeriod, "staker expired"); // TODO fix
        require(spankAmount <= staker.totalSpank, "spankAmount greater than stake");
        require(staker.spankPoints[currentPeriod+1] == 0, "staker has points for next period");

        staker.totalSpank = SafeMath.sub(staker.totalSpank, spankAmount);

        // stakers[newAddress] = Spank.Staker(spankAmount, staker.startingPeriod, staker.endingPeriod, newDelegateKey, newBootyBase); // TODO fix

        stakerByDelegateKey[newDelegateKey] = newAddress;

        emit SplitStakeEvent(msg.sender, newAddress, newDelegateKey, newBootyBase, spankAmount);
    }

    function voteToClose() public {
        updatePeriod();

        Spank.Staker storage staker = stakers[msg.sender];

        require(staker.totalSpank > 0, "stake is zero");
        // require(currentPeriod < staker.endingPeriod , "staker expired"); // TODO fix
        require(staker.votedToClose[currentPeriod] == false, "stake already voted");
        require(isClosed == false, "SpankBank already closed");

        uint256 closingVotes = periods[currentPeriod].closingVotes;
        closingVotes = SafeMath.add(closingVotes, staker.totalSpank);
        periods[currentPeriod].closingVotes = closingVotes;

        staker.votedToClose[currentPeriod] = true;

        uint256 closingTrigger = SafeMath.div(totalSpankStaked, 2);
        if (closingVotes > closingTrigger) {
            isClosed = true;
        }

        emit VoteToCloseEvent(msg.sender, currentPeriod);
    }

    function updateDelegateKey(address newDelegateKey) public {
        require(newDelegateKey != address(0), "delegateKey is zero");
        require(stakerByDelegateKey[newDelegateKey] == address(0), "delegateKey already exists");

        Spank.Staker storage staker = stakers[msg.sender];
        // require(staker.startingPeriod > 0, "staker starting period is zero"); // TODO fix

        stakerByDelegateKey[staker.delegateKey] = address(0);
        staker.delegateKey = newDelegateKey;
        stakerByDelegateKey[newDelegateKey] = msg.sender;

        emit UpdateDelegateKeyEvent(msg.sender, newDelegateKey);
    }

    function updateBootyBase(address newBootyBase) public {
        Spank.Staker storage staker = stakers[msg.sender];
        // require(staker.startingPeriod > 0, "staker starting period is zero"); // TODO fix

        staker.bootyBase = newBootyBase;

        emit UpdateBootyBaseEvent(msg.sender, newBootyBase);
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

    function getStakerFromDelegateKey(address delegateAddress) public view returns (address) {
        return stakerByDelegateKey[delegateAddress];
    }

    function getStakeIds(address stakerAddress) public view returns (bytes32[]) {
        return stakers[stakerAddress].stakes;
    }
}
