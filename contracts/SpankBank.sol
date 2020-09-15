pragma solidity 0.4.24;
import {SafeMath} from "./SafeMath.sol";
import {HumanStandardToken} from "./HumanStandardToken.sol";
import {MintAndBurnToken} from "./MintAndBurnToken.sol";
import "./BytesLib.sol";

contract SpankBank {

    using BytesLib for bytes;
    using SafeMath for uint256;

    /***********************************
        EVENTS
    ************************************/
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
        uint256 spankAmount,
        address newDelegateKey,
        address newBootyBase
    );

    event IncreaseStakeEvent (
        bytes32 stakeId,
        address staker,
        uint256 increaseAmount,
        uint256 newSpankStaked
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
        DATA STRUCTURES
    ************************************/
    struct Staker {
        uint256 totalSpank; // total SPANK staked at this address
        address delegateKey; // address used to call checkIn and claimBooty
        address bootyBase; // destination address to receive BOOTY
        bytes32[] stakes; // the stake IDs
        mapping(uint256 => uint256) spankPoints; // the spankPoints per period
        mapping(uint256 => bool) didClaimBooty; // true if staker claimed BOOTY for that period
        mapping(uint256 => bool) votedToClose; // true if staker voted to close for that period
    }

    struct Stake {
        address owner; // the staker address
        uint256 spankStaked; // the amount of spank staked
        uint256 startingPeriod; // the period this staker started staking
        uint256 endingPeriod; // the period after which this stake expires
        uint256 lastAppliedToPeriod; // the period to which this stake has last been applied as points to receive booty
    }

    struct Period {
        uint256 bootyFees; // the amount of BOOTY collected in fees
        uint256 totalSpankPoints; // the total spankPoints of all stakers
        uint256 bootyMinted; // the amount of BOOTY minted
        bool mintingComplete; // true if BOOTY has already been minted for this period
        uint256 startTime; // the starting unix timestamp in seconds
        uint256 endTime; // the ending unix timestamp in seconds
        uint256 closingVotes; // the total votes to close this period
    }

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

    mapping(bytes32 => Stake) public stakes;
    mapping(address => Staker) public stakers;
    mapping(uint256 => Period) public periods;
    mapping(address => address) public stakerByDelegateKey;

    modifier SpankBankIsOpen() {
        require(isClosed == false);
        _;
    }

    // TODO constructor needs the old booty address
    // TODO initialBootySupply is probably obsolete since stakers earn spank immediately in the next period now, even when entering on period 0 and no airdrop is needed.
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
        if (initialBootySupply > 0) {
            bootyToken.mint(this, initialBootySupply);
        }

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
     * @notice Creates a new staking position for the msg.sender. If this is the first stake for this stakerAddress, the staker is
     * automatically registered using the provided delegateKey and bootyBase parameters. Otherwise, if the msg.sender is
     * a known staker, these parameters are ignored.
     * After the stake is created, it is immediately applied to the current period, so that the staker is not required to check-in
     * anymore. Due to the automatic check-in on the first staking period, the staker must wait until the next period before splitStake
     * or increaseStake can be called.
     * Reverts if
     * - stakePeriods is outside of allowed range [1-maxPeriods]
     * - spankAmount is zero
     * - the transfer of Spank tokens into the SpankBank fails
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
        updatePeriod();

        require(stakePeriods > 0 && stakePeriods <= maxPeriods, "stake not between zero and maxPeriods"); // stake 1-12 (max) periods
        require(spankAmount > 0, "stake is 0"); // stake must be greater than 0

        // transfer SPANK to this contract - assumes sender has already "allowed" the spankAmount
        require(spankToken.transferFrom(stakerAddress, this, spankAmount));

        // a Staker cannot exist without at least one stake, so we use that to detect a new Staker to be created
        if (stakers[stakerAddress].stakes.length == 0) {
            require(delegateKey != address(0), "delegateKey is zero");
            require(bootyBase != address(0), "bootyBase is zero");
            require(stakerByDelegateKey[delegateKey] == address(0), "delegateKey already used");
            stakerByDelegateKey[delegateKey] = stakerAddress;
            bytes32[] memory stakeIDs;
            stakers[stakerAddress] = Staker(spankAmount, delegateKey, bootyBase, stakeIDs);
        }
        else {
            stakers[stakerAddress].totalSpank = SafeMath.add(stakers[stakerAddress].totalSpank, spankAmount);
        }

        // the new stake ID is generated from the staker address and the position index in the array of stakes
        // this will not cause any hash collisions as long as no stakes are deleted
        bytes32 stakeId = keccak256(abi.encodePacked(stakerAddress, stakers[stakerAddress].stakes.length));
        stakers[stakerAddress].stakes.push(stakeId);
        stakes[stakeId] = Stake(stakerAddress, spankAmount, currentPeriod, currentPeriod + stakePeriods - 1, 0);

        uint256 stakePoints = _applyStakeToCurrentPeriod(stakeId);

        totalSpankStaked = SafeMath.add(totalSpankStaked, spankAmount);

        emit StakeEvent(
            stakeId,
            stakerAddress,
            currentPeriod,
            stakePoints,
            spankAmount,
            stakePeriods,
            delegateKey,
            bootyBase
        );
    }

    /**
     * @notice Called during stake and checkIn to generate points from the given stake and apply them towards the current period. Afterwards, the stake is marked
     * as having been applied. However, this function does not actively check the `lastAppliedToPeriod` value, because it would prevent points being applied in period 0.
     * Calling functions must `require(stk.lastAppliedToPeriod < currentPeriod)` to prevent duplicate points for the same stake.
     *
     * @param stakeId - the stake ID being used for points towards the current period
     * @return stakePoints - the generated points of this stake
     */
    function _applyStakeToCurrentPeriod(bytes32 stakeId) internal returns (uint256 stakePoints) {
        Stake storage stk = stakes[stakeId];
        Staker storage staker = stakers[stk.owner];

        uint256 stakePeriods = stk.endingPeriod - currentPeriod + 1; // + 1 is added to correctly calculate the total number of staking periods *including* the currentPeriod
        stakePoints = SafeMath.div(SafeMath.mul(stk.spankStaked, pointsTable[stakePeriods]), 100);

        // add staker spankpoints to total spankpoints for this period
        uint256 totalPoints = periods[currentPeriod].totalSpankPoints;
        totalPoints = SafeMath.add(totalPoints, stakePoints);
        periods[currentPeriod].totalSpankPoints = totalPoints;

        staker.spankPoints[currentPeriod] = SafeMath.add(staker.spankPoints[currentPeriod], stakePoints);
        stk.lastAppliedToPeriod = currentPeriod; // mark stake as having been used for this period
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

    /**
     * @notice Reports fees for the current period by transferring the specified amount of Booty from the msg.sender into the SpankBank.
     * The accumulated fees will be burnt upon calling mintBooty() in the following period.
     * Reverts if
     * - the bootyAmount is zero
     * - the booty transfer into the bank fails
     *
     * @param bootyAmount - the amount of Booty to transfer
     */
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

    /**
     * @notice Performs the minting process for the last period by burning last period's fees,
     * then checking the current BOOTY supply against the target supply rules and, if necessary,
     * minting BOOTY to be claimed by stakers with applied (checked-in) stakes in the last period.
     * Reverts if
     * - the current period is zero and therefore no previous period exists
     * - minting has already been performed for this period
     */
    function mintBooty() SpankBankIsOpen public {
        updatePeriod();

        // can't mint BOOTY during period 0 - would result in integer underflow
        require(currentPeriod > 0, "current period is zero");

        Period storage period = periods[currentPeriod - 1];
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

    /**
     * @notice Checks the current time and updates the current period accordingly.
     * - called from all write functions to ensure the period is always up to date before any writes
     * - can also be called externally, but there isn't a good reason for why you would want to
     * - the while loop protects against the edge case where we miss a period
     */
    function updatePeriod() public {
        while (now >= periods[currentPeriod].endTime) {
            Period memory prevPeriod = periods[currentPeriod];
            currentPeriod += 1;
            periods[currentPeriod].startTime = prevPeriod.endTime;
            periods[currentPeriod].endTime = SafeMath.add(prevPeriod.endTime, periodLength);
        }
    }

    /**
     * @notice In order to receive Booty, each staker must check-in once per period.
     * This check-in will compute the spankPoints locally and globally for each staker.
     * Usage example:
     * - Staker has multiple stakes.
     * - Calling `checkIn(["0x123456","0x1a2b3c"], [38,0])` will perform a check-in on the stakes with the given bytes32 IDs and update the second stake's endingPeriod to 38.
     * Reverts if:
     * - a stake is empty, e.g. because it's been withdrawn or it does not exist
     * - the caller is not the owner of the stake or delegate of the staker
     * - a stake is expired
     * - a stake has already been applied to the current period (e.g. via checkIn or stake)
     * - an update for a stake's ending period is less than its current ending period or is >= currentPeriod + maxPeriods
     *
     * @param stakeIds - an array of Stake IDs for which the staker would like to check in
     * @param updatedEndingPeriods - an array of updated ending periods matching the indexes of the stakeIds. A 0-value indicates no update for that stake.
     */
    function checkIn(bytes32[] stakeIds, uint256[] updatedEndingPeriods) SpankBankIsOpen public {
        updatePeriod();

        address stakerAddress =  stakerByDelegateKey[msg.sender];
        Staker storage staker = stakers[stakerAddress];

        for (uint256 i = 0; i < stakeIds.length; i++) {
            Stake storage stk = stakes[stakeIds[i]];
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
            _applyStakeToCurrentPeriod(stakeIds[i]);
            emit CheckInEvent(stakeIds[i], stakerAddress, currentPeriod, staker.spankPoints[currentPeriod], stk.endingPeriod);
        }
    }

    /**
     * @notice Performs a withdrawal of all booty the msg.sender has accumulated over the specified periods. All periods being claimed
     * must meet eligibility requirements or the transaction will revert.
     * Reverts if
     * - a claimPeriod is not less than the currentPeriod
     * - minting did not happen for a period
     * - the staker has no points in a period
     * - the staker already claimed booty for a period
     *
     * @param claimPeriods - an array of periods for which booty is being claimed
     */
    function claimBooty(uint256[] claimPeriods) public {
        updatePeriod();

        address stakerAddress = stakerByDelegateKey[msg.sender];
        Staker storage staker = stakers[stakerAddress];
        uint256 totalBootyOwed;
        Period memory period;
        for (uint256 i = 0; i < claimPeriods.length; i++) {
            require(claimPeriods[i] < currentPeriod, "claimPeriod must be less than currentPeriod");
            period = periods[claimPeriods[i]];
            require(period.mintingComplete, "booty not minted");
            uint256 stakerSpankPoints = staker.spankPoints[claimPeriods[i]];
            require(stakerSpankPoints > 0, "staker has no points");
            require(!staker.didClaimBooty[claimPeriods[i]], "staker already claimed"); // can only claim booty once per period
            staker.didClaimBooty[claimPeriods[i]] = true;
            uint256 bootyOwed = SafeMath.div(SafeMath.mul(stakerSpankPoints, period.bootyMinted), period.totalSpankPoints);
            totalBootyOwed = SafeMath.add(totalBootyOwed, bootyOwed);
        }

        require(bootyToken.transfer(staker.bootyBase, totalBootyOwed));

        emit ClaimBootyEvent(stakerAddress, claimPeriods.length, totalBootyOwed);
    }

    /**
     * @notice Withdraws the staked Spank from the specified stakes. Stakes can only be withdrawn after a wait period after their expiration,
     * e.g. a stake's ending period (in which the stake was last available for check-in and booty claims) is followed by a one-period wait time before
     * the stake can be withdrawn. This guarantees that stakers commit their Spank for at least one full period and prevents staking and immediate
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

        Staker storage staker = stakers[msg.sender];

        uint256 spankToWithdraw = 0;
        for (uint256 i = 0; i < stakeIds.length; i++) {
            Stake storage stk = stakes[stakeIds[i]];
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
     * @notice Splits the given stake by transfering the specified spankAmount into a new stake for the designated
     * staker. If the receiving staker is perviously unknown, a new staker will automatically be registered using
     * the delegateKey and bootyBase parameters; for an existing staker, these parameters are optional.
     * The created stake will inherit the starting and ending period attributes of the source stake.
     * Note: Unlike the #stake() function, there is no automatic check-in, i.e. application of points for the newly created stake.
     * The new staker still has to perform a check-in on the current period after the split!
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

        Stake storage sourceStake = stakes[stakeId];
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
            stakers[newAddress] = Staker(spankAmount, newDelegateKey, newBootyBase, stakeIDs);
            stakerByDelegateKey[newDelegateKey] = newAddress;
        }
        else {
            stakers[newAddress].totalSpank = SafeMath.add(stakers[newAddress].totalSpank, spankAmount);
        }

        bytes32 newStakeId = keccak256(abi.encodePacked(newAddress, stakers[newAddress].stakes.length));
        Staker storage staker = stakers[msg.sender];
        sourceStake.spankStaked = SafeMath.sub(sourceStake.spankStaked, spankAmount);
        staker.totalSpank = SafeMath.sub(staker.totalSpank, spankAmount);

        stakers[newAddress].stakes.push(newStakeId);
        stakes[newStakeId] = Stake(newAddress, spankAmount, sourceStake.startingPeriod, sourceStake.endingPeriod, 0);

        emit SplitStakeEvent(
            stakeId,
            newStakeId,
            msg.sender,
            newAddress,
            spankAmount,
            newDelegateKey,
            newBootyBase
        );
    }

    /**
     * @notice Adds the specified amount to the given stake.
     * This function allows a staker to increase one of the owned stakes ahead of a checkIn to increase the spankPoints the stake will generate.
     * Reverts if
     * - the specified increase is 0
     * - the transfer of Spank tokens into the SpankBank fails
     * - the specified stake is expired
     * - the specified stake was already applied to the current period (via checkIn or stake)
     *
     * @param stakeId - the stake to increase
     * @param increaseAmount - the amount of SPANK to add to the stake
     */
    function increaseStake(bytes32 stakeId, uint256 increaseAmount) public {
        updatePeriod();

        require(increaseAmount > 0, "increaseAmount is zero");
        Stake storage stk = stakes[stakeId];
        require(stk.owner == msg.sender, "stake has different owner");
        require(currentPeriod <= stk.endingPeriod, "stake is expired");
        require(stk.lastAppliedToPeriod < currentPeriod, "stake already applied to current period");

        // transfer SPANK to this contract - assumes sender has already "allowed" the amount
        require(spankToken.transferFrom(msg.sender, this, increaseAmount));

        stk.spankStaked = SafeMath.add(stk.spankStaked, increaseAmount);
        stakers[msg.sender].totalSpank = SafeMath.add(stakers[msg.sender].totalSpank, increaseAmount);
        totalSpankStaked = SafeMath.add(totalSpankStaked, increaseAmount);

        emit IncreaseStakeEvent(
            stakeId,
            msg.sender,
            increaseAmount,
            stk.spankStaked
        );
    }

    /**
     * @notice Records a vote for the msg.sender in favor of closing the SpankBank. In order to be eligible to add their vote,
     * stakers must have at least one active stake, i.e. a stake that is not expired with a non-zero amount of 

     // TODO there is a potential (resolvable) deadlock hidden in this function: If the majority of staked SPANK is in expired stakes that were not withdrawn yet, this could prevent all active stakers from reaching a majority vote. (expired, but not withdrawn stakes still count towards the totalSpankStaked of the bank)
     Options: During withdrawStake(), check if bank is closed and rerun the closingTrigger check after subtracting stake. This way withdrowing can resolve the deadlock ... so could someone with enough SPANK to open a new stake to help get the vote over the threshold.

     * Reverts if:
     * - the staker has no Spank staked
     * - the staker has no active (not expired) stakes
     * - the staker already voted
     * - the SpankBank was already closed
     */
    function voteToClose() public {
        updatePeriod();

        Staker storage staker = stakers[msg.sender];

        require(staker.totalSpank > 0, "staker has no Spank"); // this is just a shortcut to avoid the below loop for older stakers that had many stakes, but withdrew all
        // voting requires the staker to have at least one active stake
        bool activeStakes = false;
        // this is the only loop over a growing array in the bank, but it should be ok since it aborts looping as soon as one active stake is found
        for (uint256 i = 0; i < staker.stakes.length; i++) {
            if(currentPeriod <= stakes[staker.stakes[i]].endingPeriod && stakes[staker.stakes[i]].spankStaked > 0) {
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
     * @notice Updates the delegateKey associated with the msg.sender staker to the specified one.
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

        Staker storage staker = stakers[msg.sender];
        require(staker.stakes.length > 0, "staker does not exist");

        stakerByDelegateKey[staker.delegateKey] = address(0);
        staker.delegateKey = newDelegateKey;
        stakerByDelegateKey[newDelegateKey] = msg.sender;

        emit UpdateDelegateKeyEvent(msg.sender, newDelegateKey);
    }

    /**
     * @notice Updates the bootyBase associated with the msg.sender staker to the specified one.
     * Reverts if:
     * - staker (msg.sender) does not exist
     *
     * @param newBootyBase - the new delegateKey
     */
    function updateBootyBase(address newBootyBase) public {
        Staker storage staker = stakers[msg.sender];
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
