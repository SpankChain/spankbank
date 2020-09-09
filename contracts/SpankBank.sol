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
        bytes32 stakeId,
        address staker,
        uint256 period,
        uint256 spankPoints,
        uint256 stakeEndingPeriod
    );

    event ClaimBootyEvent (
        address staker,
        uint256 startClaimPeriod,
        uint256 claimedPeriods,
        uint256 bootyOwed
    );

    event WithdrawStakeEvent (
        address staker,
        uint256 totalSpankToWithdraw
    );

    event SplitStakeEvent (
        bytes32 fromStakeId,
        bytes32 toStakeId,
        address fromStaker,
        address toStaker,
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

    // TODO constructor needs the old booty address to consider in total booty supply
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
        doStake(msg.sender, spankAmount, stakePeriods, delegateKey, bootyBase);
    }

    function doStake(address stakerAddress, uint256 spankAmount, uint256 stakePeriods, address delegateKey, address bootyBase) internal {
        require(stakePeriods > 0 && stakePeriods <= maxPeriods, "stake not between zero and maxPeriods"); // stake 1-12 (max) periods
        require(spankAmount > 0, "stake is 0"); // stake must be greater than 0

        updatePeriod();

        // transfer SPANK to this contract - assumes sender has already "allowed" the spankAmount
        require(spankToken.transferFrom(stakerAddress, this, spankAmount));

        // a Staker cannot exist without at least one stake, so we use that to detect a new Staker to be created
        if (stakers[stakerAddress].stakes.length == 0) {
            require(delegateKey != address(0), "delegateKey is zero");
            require(bootyBase != address(0), "bootyBase is zero");
            require(stakerByDelegateKey[delegateKey] == address(0), "delegateKey already used");
            bytes32[] memory stakeIDs;
            stakers[stakerAddress] = Spank.Staker(0, delegateKey, bootyBase, stakeIDs); // initialize totalSpank as 0. spankAmount is added below
            stakerByDelegateKey[delegateKey] = stakerAddress;
        }

        // the new stake ID is generated from the staker address and the position index in the array of stakes
        // this will not cause any hash collisions as long as no stakes are deleted
        bytes32 stakeId = keccak256(abi.encodePacked(stakerAddress, stakers[stakerAddress].stakes.length));
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
     * @dev In order to receive Booty, each staker must check-in every period.
     * This check-in will compute the spankPoints locally and globally for each staker.
     * Example: Staker has 5 stakes. Calling `checkIn([0,3], [38,0])` will perform a check-in
     * on stakes 1 and 4 with the ending period of stake 4 being set to period 38.
     * Reverts if:
     * - stake is empty, e.g. because it's been withdrawn or it does not exist
     * - caller is not the original staker or delegate of the staker
     * - stake is expired
     * - a check-in for the current period already happened
     * - an update for a stake's ending period is less than its current ending period or exceeds currentPeriod + maxPeriods
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
            require(stk.spankStaked > 0, "stake is zero");
            require(stk.owner == stakerAddress, "stake has different owner");
            require(currentPeriod <= stk.endingPeriod, "stake is expired");
            require(stk.lastAppliedToPeriod < currentPeriod, "cannot check-in twice for the same stake and period");
            // If updatedEndingPeriod is 0, don't update the ending period
            if (updatedEndingPeriods[i] > 0) {
                require(updatedEndingPeriods[i] > stk.endingPeriod, "updatedEndingPeriod less than or equal to stake endingPeriod");
                require(updatedEndingPeriods[i] < currentPeriod + maxPeriods, "updatedEndingPeriod greater than currentPeriod and maxPeriods");
                stk.endingPeriod = updatedEndingPeriods[i];
            }
            uint256 stakePeriods = stk.endingPeriod - currentPeriod;
            _applyStakeToCurrentPeriod(stakerAddress, stakeIds[i], stakePeriods);
            emit CheckInEvent(stakeIds[i], stakerAddress, currentPeriod, staker.spankPoints[currentPeriod], stk.endingPeriod);
        }
    }

    /**
     * @dev Performs a withdrawal of all booty the msg.sender has accumulated since the specified startClaimPeriod up to
     * and including the last period before the current.
     * Reverts if
     * // TODO rewrite with bytes32 array to withdraw. keeps more control over the loop and requires all IDs to be active stakes
     *
     * @param startClaimPeriod - specifies the range of startClaimPeriod - currentPeriod-1 for which booty is being claimed
     */
    function claimBooty(uint256 startClaimPeriod) public {
        updatePeriod();

        require(startClaimPeriod < currentPeriod, "startClaimPeriod must be less than currentPeriod");
        address stakerAddress = stakerByDelegateKey[msg.sender];
        Spank.Staker storage staker = stakers[stakerAddress];
        uint256 claimPeriod = startClaimPeriod;
        uint256 totalBootyOwed;
        uint256 successClaims; // only used for reporting the number of successful claims in the event
        Spank.Period memory period;
        while (claimPeriod < currentPeriod) {
            period = periods[claimPeriod];
            require(period.mintingComplete, "booty not minted");
            if(staker.spankPoints[claimPeriod] > 0) {
                continue; // skip periods where no points were awarded, i.e. no check-in
            }
            require(!staker.didClaimBooty[claimPeriod], "staker already claimed"); // can only claim booty once per period
            uint256 stakerSpankPoints = staker.spankPoints[claimPeriod];
            staker.didClaimBooty[startClaimPeriod] = true;
            uint256 bootyOwed = SafeMath.div(SafeMath.mul(stakerSpankPoints, period.bootyMinted), period.totalSpankPoints);
            totalBootyOwed = SafeMath.add(totalBootyOwed, bootyOwed);
            claimPeriod++; // No need for SafeMath since it must be smaller than currentPeriod
            successClaims++;
        }

        require(bootyToken.transfer(staker.bootyBase, bootyOwed));

        emit ClaimBootyEvent(stakerAddress, startClaimPeriod, successClaims, totalBootyOwed);
    }

    /**
     * @dev Withdraws the staked Spank from the specified stakes. Stakes can only be withdrawn after a wait period after their expiration,
     * e.g. a stake's ending period (in which the stake was available for check-in and points) is followed by a one-period wait time before
     * the stake can be withdrawn. This guarantees that stakers commit their Spank for at least one period and prevents staking and immediate
     * withdrawal in the following period.
     * Reverts if
     * - stake is empty, e.g. because it's been withdrawn or it does not exist
     * - caller is not the original staker
     * - the waiting period (1 period after stake expiration) has not yet passed
     * 
     * @param stakeIds an array of Stake IDs for which the stake should be withdrawn
     */
    function withdrawStake(bytes32[] stakeIds) public {
        updatePeriod();

        Spank.Staker storage staker = stakers[msg.sender];

        uint256 spankToWithdraw = 0;
        for (uint256 i = 0; i < stakeIds.length; i++) {
            Spank.Stake storage stk = stakes[stakeIds[i]];
            require(isClosed || currentPeriod > stk.endingPeriod + 1, "currentPeriod less than waiting period or spankbank not closed");
            require(stk.spankStaked > 0, "stake is zero");
            require(stk.owner == msg.sender, "stake has different owner");
            spankToWithdraw = SafeMath.add(spankToWithdraw, stk.spankStaked);
            staker.totalSpank = SafeMath.sub(staker.totalSpank, stk.spankStaked);
            totalSpankStaked = SafeMath.sub(totalSpankStaked, stk.spankStaked);
            stk.spankStaked = 0;
        }

        spankToken.transfer(msg.sender, spankToWithdraw);

        emit WithdrawStakeEvent(msg.sender, spankToWithdraw);
    }

    /**
     * @dev Splits the given stake by transfering the specified spankAmount into a new stake for the designated
     * staker. If the receiving staker is perviously unknown, a new staker will automatically be registered using
     * the delegateKey and bootyBase parameters; for an existing staker, these are optional.
     * The created stake will inherit the starting and ending period attributes of the source stake.
     * Reverts if
     * - newAddress is zero address
     * - spankAmount is zero
     * - Spank in the stake is less than split amount
     * - stake was not applied to the current period, yet (checked-in)
     * - newDelegateKey is zero address (only for unknown staker address)
     * - newBootyBase is zero address (only for unknown staker address)
     * - newDelegateKey is already used (only for unknown staker address)
     *
     * @param stakeId - the stake from which to split
     * @param newAddress - the receiving staker address
     * @param newDelegateKey - the address permitted to act as delegate of the calling Staker (optional, if staker already registered)
     * @param newBootyBase - the address to which claimed booty is sent (optional, if staker already registered)
     * @param spankAmount - the amoung of Spank to transfer
     */
    function splitStake(bytes32 stakeId, address newAddress, address newDelegateKey, address newBootyBase, uint256 spankAmount) public {
        updatePeriod();

        require(newAddress != address(0), "newAddress is zero");
        require(spankAmount > 0, "spankAmount is zero");

        Spank.Stake storage sourceStake = stakes[stakeId];
        require(sourceStake.spankStaked > 0, "stake is zero");
        require(sourceStake.owner == msg.sender, "stake has different owner");
        require(currentPeriod <= sourceStake.endingPeriod, "stake is expired");
        require(spankAmount <= sourceStake.spankStaked, "spankAmount greater than stake");
        require(sourceStake.lastAppliedToPeriod < currentPeriod, "stake already applied to current period");

        // a Staker cannot exist without at least one stake, so we use that to detect a new Staker to be created
        if (stakers[newAddress].stakes.length == 0) {
            require(newDelegateKey != address(0), "delegateKey is zero");
            require(newBootyBase != address(0), "bootyBase is zero");
            require(stakerByDelegateKey[newDelegateKey] == address(0), "delegateKey already used");
            bytes32[] memory stakeIDs;
            stakers[newAddress] = Spank.Staker(0, newDelegateKey, newBootyBase, stakeIDs); // initialize totalSpank as 0. spankAmount is added below
            stakerByDelegateKey[newDelegateKey] = newAddress;
        }

        bytes32 newStakeId = keccak256(abi.encodePacked(newAddress, stakers[newAddress].stakes.length));
        Spank.Staker storage staker = stakers[msg.sender];
        sourceStake.spankStaked = SafeMath.sub(sourceStake.spankStaked, spankAmount);
        staker.totalSpank = SafeMath.sub(staker.totalSpank, spankAmount);

        stakers[newAddress].stakes.push(newStakeId);
        stakers[newAddress].totalSpank = SafeMath.add(stakers[newAddress].totalSpank, spankAmount);
        stakes[newStakeId] = Spank.Stake(newAddress, spankAmount, sourceStake.startingPeriod, sourceStake.endingPeriod, 0);

        emit SplitStakeEvent(stakeId, newStakeId, msg.sender, newAddress, newDelegateKey, newBootyBase, spankAmount);
    }

    /**
     * @dev Records a vote for the msg.sender staker in favor of closing the SpankBank.
     * Reverts if:
     * - the staker has no Spank staked
     * - the staker has no active (not expired) stakes
     * - the staker already voted
     * - the SpankBank was already closed
     */
    function voteToClose() public {
        updatePeriod();

        Spank.Staker storage staker = stakers[msg.sender];

        require(staker.totalSpank > 0, "stake is zero");
        // voting requires the staker to have at least one active stake // TODO need to check spankStaked? which would make the totalSpank check above obsolete?
        bool activeStakes = false;
        // this is the only 'growing' loop in the bank, but should be ok since it aborts looping as soon as one active stake is found
        for (uint256 i = 0; i < staker.stakes.length; i++) {
            if(currentPeriod <= stakes[staker.stakes[i]].endingPeriod) {
                activeStakes = true;
                break;
            }
        }
        require(activeStakes , "no active stakes");
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

    /**
     * @dev Updates the delegateKey associated with the msg.sender staker to the specified one.
     * Reverts if:
     * - newDelegateKey is zero address
     * - newDelegateKey is already in use
     * - staker (msg.sender) does not exist
     *
     * @param newDelegateKey - the new delegateKey
     */
    function updateDelegateKey(address newDelegateKey) public {
        require(newDelegateKey != address(0), "delegateKey is zero");
        require(stakerByDelegateKey[newDelegateKey] == address(0), "delegateKey already used");

        Spank.Staker storage staker = stakers[msg.sender];
        require(staker.stakes.length > 0, "staker does not exist");

        stakerByDelegateKey[staker.delegateKey] = address(0);
        staker.delegateKey = newDelegateKey;
        stakerByDelegateKey[newDelegateKey] = msg.sender;

        emit UpdateDelegateKeyEvent(msg.sender, newDelegateKey);
    }

    /**
     * @dev Updates the bootyBase associated with the msg.sender staker to the specified one.
     * Reverts if:
     * - staker (msg.sender) does not exist
     *
     * @param newBootyBase - the new delegateKey
     */
    function updateBootyBase(address newBootyBase) public {
        Spank.Staker storage staker = stakers[msg.sender];
        require(staker.stakes.length > 0, "staker does not exist");

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
