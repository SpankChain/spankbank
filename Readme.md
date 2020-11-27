# SpankBank

The SpankBank is an algorithmic central bank that powers the two-token SpankChain economic system.

1. SPANK is a staking token which can be deposited with the SpankBank to earn newly minted BOOTY.

2. BOOTY is low-volatility fee credit good for $1 worth of SpankChain services.

SpankChain will collect fees for using its products, payment hub, advertising network, and other services in BOOTY. The fees are sent to the SpankBank where they are counted and burned.

The SpankBank has a 30 day billing period. At the beginning of each new period, if the total BOOTY supply is under the target supply (20x the total fees collected in the previous period), new BOOTY is minted to reach the target supply and distributed proportionally to all SPANK stakers.

In the future, we plan to add features to incentivize decentralized moderation of the SpankChain platform, rewarding BOOTY to those who help maintain its integrity. We also plan to add mechanisms that will incentivize maintaining the $1 BOOTY peg.

## Usage

By calling the `stake` function SPANK holders can create stakes in the SpankBank in which SPANK tokens are locked for up to 12 (30 day) periods. A new stake can be created at any time before the end of a period and the staker will be eligible to claim BOOTY in the next one. Because of this, an extra period is added to the end of the stake to guarantee stakes are committed for 1 to 12 *full* periods, before a staker can withdraw SPANK out of an expired stake by calling the `withdrawStake` function. BOOTY fees for the ongoing period can be paid to the SpankBank by anyone by calling the `sendFees` function. When a new period starts, anyone can mint BOOTY for the previous period by calling the `mintBooty` function. Once BOOTY has been minted for a previous period, the stakers who had eligible stakes that period can call the `claimBooty` function to claim their BOOTY. In order to be eligible to receive BOOTY, during each staking period stakers have to check in with the SpankBank by calling the `checkIn` function. When checking in, stakers can optionally extend their stakes for additional periods.

If stakers want to only partially extend their stake (e.g. extend only 50% of their stake by an additional month, not all of it) or to transfer some of their stake to a new address (e.g. for security reasons) they can do so by calling the `splitStake` function.

If stakers want to close the SpankBank and be able to withdraw early (e.g. in case of catastrophic bug or planned upgrade), they can call the `voteToClose` function. If stakers accounting for more than 50% of the staked SPANK call `voteToClose` in the same period, the SpankBank will immediately transition to a "closed" state and allow stakers to withdraw early.

A new stake participates in the current period immediately, no matter how close to the end of the period it's created. It is therefore eligible to claim any BOOTY minted in the next period and awarded according to the stake's points. Because of this, and in order to ensure that a staker completes the promised number of staking periods in full, a stake can only be withdrawn after waiting an additional period after the stake's expiry.

Example:
- Staker creates a stake for 10 periods entering on period 69.
- Stake automatically generates points for the staker for period 69.
- In period 70, the staker can claim minted BOOTY for the first time
- Staker checks in for this stake without extending over the following 9 periods; period 79 being the last one for which the stake will generate points.
- Period 80 is the waiting period and in period 81 the staked SPANK can be withdrawn.

If a staker does not extend the stake during check-in on its final `endingPeriod`, the stake is regarded as expired and can only be withdrawn.

## Other Considerations

### Upgrading the SpankBank

We have decided to forego attempting to make the SpankBank directly upgradeable
onchain because of the additional complexity and foresight required today to make the
present SpankBank forward compatible with the next version. Instead, when it is
time to upgrade SpankChain will deploy a new SpankBank smart contract and the
stakers will be able to `voteToClose` the old SpankBank, withdraw their SPANK,
and optionally re-stake in the new SpankBank.

### Convenience vs. Security: delegateKey and bootyBase

We expect that stakers will have varying preferences for security vs. convenience, and so we designed the SpankBank to allow stakers to optionally split up responsibilities across multiple accounts. The `delegateKey` may be used to `checkIn` and `claimBooty` every month, and the `bootyBase` is where the claimed BOOTY will be deposited. The account originally used to stake (the `staker.address`) must be used to `splitStake`, `increaseStake`, `withdrawStake`, `voteToClose`, `updateDelegateKey`, and `updateBootyBase`.

Should stakers maximally prefer convenience, they can use the same address for all three and never think about this again. Should stakers maximally prefer security, they could use a multi-sig wallet or hardware wallet to stake, keep that account in cold storage and secure, and only use it as needed (e.g. 1 year later to withdraw). They could then use a second account as the `delegateKey`, which they would keep hot and only use once a month to `checkIn` and `claimBooty`, and use a third account as their `bootyBase`. Splitting up these accounts makes it so that hackers would need to take over both the `delegateKey` and the `bootyBase` in order to steal a staker's BOOTY for the period, at which point the staker could call `updateDelegateKey` and `updateBootyBase` to regain control.

The most important security risk around having a `delegateKey` hacked is that it can be used to `checkIn` and potentially increase the staking period to the maximum, which cannot be undone.

## Data Structures

#### Global Constants

`uint256 public periodLength;` - time length of each period in seconds (30 days = 2592000 seconds)

`uint256 public maxPeriods;` - maximum number of staking periods (12)

`HumanStandardToken public spankToken;` - the SPANK token contract reference

`MintableToken public bootyToken;` - the BOOTY token contract reference

#### SpankPoints

Stakers are rewarded with extra BOOTY for staking for additional periods. The `SpankPoints` for each staker are calculated as the amount of SPANK staked multiplied by the staking factor. The staking factor ranges from 100% if staking for the maximum length of 12 periods, to 45% for staking the minimum length of 1 period.
```
  // LOOKUP TABLE FOR STAKING FACTOR BY PERIOD
  // 1 -> 45%
  // 2 -> 50%
  // ...
  // 12 -> 100%
  mapping(uint256 => uint256) pointsTable;
```
In order to continuously earn the maximum BOOTY, a staker would create a stake for 12 periods, and then opt to extend their stake by 1 period during every check in.

If a staker stakes for 12 periods but doesn't opt to extend their stake during check ins, they would receive 100% of the BOOTY for the first period, 95% for the second period, and so forth until they receive 45% during the final period.

#### Internal Accounting

`uint256 public currentPeriod = 0;` - the current period number

`uint256 public totalSpankStaked;` - the total SPANK staked across all stakers

`bool public isClosed;` - true if voteToClose has passed, allows early withdrawals

##### Stakers

The `Staker` struct stores all relevant data for each staker and is saved in the `stakers` mapping by the staker's address.

```
    struct Staker {
        uint256 totalSpank; // total SPANK staked at this address
        address delegateKey; // address used to call checkIn and claimBooty
        address bootyBase; // destination address to receive BOOTY
        bytes32[] stakes; // the stake IDs belonging to this staker
        mapping(uint256 => uint256) spankPoints; // the spankPoints per period
        mapping(uint256 => bool) didClaimBooty; // true if staker claimed BOOTY for that period
        mapping(uint256 => bool) votedToClose; // true if staker voted to close for that period
    }

  mapping(address => Staker) public stakers;
```
The `staker.spankPoints` mapping stores the staker's spank points for each period. The `staker.didClaimBooty` mapping tracks whether or not the staker has claimed their BOOTY for each period.

##### Stakes

The `Stake` struct stores all relevant data for each stake and is saved in the `stakes` mapping by the stake's ID.

```
    struct Stake {
        address owner; // the staker address
        uint256 spankStaked; // the amount of spank staked
        uint256 startingPeriod; // the period this staker started staking
        uint256 endingPeriod; // the period after which this stake expires
        uint256 lastAppliedToPeriod; // the period to which this stake has last been applied as points to receive booty
    }
```

##### Periods

The `Period` struct stores all relevant data for each period and is saved in the `periods` mapping by the period number.
```
    struct Period {
        uint256 bootyFees; // the amount of BOOTY collected in fees
        uint256 totalSpankPoints; // the total spankPoints of all stakers
        uint256 bootyMinted; // the amount of BOOTY minted
        bool mintingComplete; // true if BOOTY has already been minted for this period
        uint256 startTime; // the starting unix timestamp in seconds
        uint256 endTime; // the ending unix timestamp in seconds
        uint256 closingVotes; // the total votes to close this period
    }

  mapping(uint256 => Period) public periods;
```
The data for each period is set in the following order:

1. The `totalSpankPoints` are tallied during an ongoing period, as stakes get created or become eligible by calling `checkIn`.
2. The `startTime` and `endTime` are set when the period starts, when the `updatePeriod` function is called.
3. The `bootyFees` are tallied during the period, as the `sendFees` function is called.
4. The `closingVotes` are tallied during the period, as stakers call `voteToClose`.
5. Once the period is over, `bootyMinted` and `mintingComplete` are set when the `mintBooty` function is called in the next period.

## Functionality

### SpankBank Constructor

```
    /**
     * @notice Creates the SpankBank contract using the provided initialization parameters.
     * The optional `initialBootySupply` parameter can be used to create an initial supply of BOOTY, e.g. for an airdrop or distribution after
     * an upgrade. Because the SpankBank has to be in control of the BOOTY supply, a new SpankBank requires its own BOOTY contract to be
     * created and existing BOOTY holders must be given an amount of the new BOOTY equal to their current holdings.
     * There is no mechansim to transfer the ownership over the BOOTY supply from a previous SpankBank.
     * 
     * 1. Sets the `maxPeriods` global constant
     * 2. Saves the SPANK token reference as `spankAddress`.
     * 3. Deploys a new BOOTY token contract and mints `initialBootySupply` BOOTY tokens.
     * 4. Transfers all newly minted BOOTY to the `msg.sender`.
     * 5. Immediately starts the first period (period 0) at `startTime = now`.
     * 6. Sets the `endTime` of the first period `now` plus periodLength.
     *
     * @param _maxPeriods - the maximum nummber of periods into the future a stake can be locked up, before a withdrawl is allowed
     * @param spankAddress - the address of the Spank token
     * @param initialBootySupply - the initial booty supply to be minted (optional)
     * @param bootyTokenName - the Booty token name
     * @param bootyDecimalUnits - the Booty token decimal units
     * @param bootySymbol - the Booty token symbel
     */
    constructor (
        uint256 _maxPeriods,
        address spankAddress,
        uint256 initialBootySupply,
        string bootyTokenName,
        uint8 bootyDecimalUnits,
        string bootySymbol
    )   public {
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

        emit SpankBankCreated(_maxPeriods, spankAddress, initialBootySupply, bootyTokenName, bootyDecimalUnits, bootySymbol);
    }
```

### updatePeriod

```
    /**
     * @notice Checks the current time and updates the current period, if needed.
     *
     * In order to make sure all interactions with the SpankBank take place during the correct period, this function is called at the beginning
     * of every state-updating function. So long as the current time (`now`) is already greater than the `endTime` of what
     * the SpankBank thinks is the current period, the `currentPeriod` is incremented by one. Once the correct current period is found,
     * the `startTime` and the `endTime` for that `Period` are initialized.
     * The function can also be called externally, but there isn't a good reason since any interaction with SpankBank that results
     * in state changes already does.
     * The reason this is done using a `while` loop is just in case an entire period passes without any SpankBank interactions taking place.
     * This is extremely unlikely and would mean no fees were paid not a single staker checked in, but we wanted to protect against that scenario anyways.
     * One scenario the `updatePeriod` function does not protect against is if enough periods pass without any SpankBank interactions that in order
     * to catch up to the current period the `while` loop would have to run out of gas. The `updatePeriod` function using 21272 gas, at the current
     * 8M gas limit it would take 31 years of not interacting with the `SpankBank` for this to happen.
     */
    function updatePeriod() public {
        while (now >= periods[currentPeriod].endTime) {
            Period memory prevPeriod = periods[currentPeriod];
            currentPeriod += 1;
            periods[currentPeriod].startTime = prevPeriod.endTime;
            periods[currentPeriod].endTime = SafeMath.add(prevPeriod.endTime, periodLength);
        }
    }
```

### Staking

Staking in the SpankBank comprises three functions: `stake`, `receiveApproval`, and `doStake`. This allows for different combinations
how to incorporate the required approval of the SPANK transfer into the SpankBank.

#### stake

```
    /**
     * @notice Creates a new staking position for the `msg.sender` by calling the `doStake` function with the provided parameters.
     *
     * Important: Approval for the transfer of SPANK from the SPANK token contract into the SpankBank is assumed to have been provided
     * prior to calling this function, otherwise the transaction will fail!
     *
     * @param spankAmount - amount of Spank to stake
     * @param stakePeriods - number of periods to stake initially
     * @param delegateKey - the address permitted to act as delegate of the calling Staker (optional, if staker already registered)
     * @param bootyBase - the address to which claimed booty is sent (optional, if staker already registered)
     */ 
    function stake(uint256 spankAmount, uint256 stakePeriods, address delegateKey, address bootyBase) SpankBankIsOpen public {
        doStake(msg.sender, spankAmount, stakePeriods, delegateKey, bootyBase);
    }
```

#### receiveApproval

```
    /**
     * @notice Convenience function to improve the UX of staking.
     * It allows the user to combine calling the `approve` function on the SPANK contract and
     * the `stake` function on this contract in one transaction by calling `approveAndCall` on the SPANK contract which forwards
     * a bytes payload with the staking parameters to this `receiveApproval` function which then stakes as usual by calling `doStake`.
     * 
     * @param from - the staker's address
     * @param amount - the amount to stake (for which approval was given in the SPANK contract)
     * @param tokenContract - the SPANK contract's address
     * @param extraData - a bytes payload containing the remaining staking parameters for the `doStake` function
     */
    function receiveApproval(address from, uint256 amount, address tokenContract, bytes extraData) SpankBankIsOpen public returns (bool success) {
        require(msg.sender == address(spankToken), "invalid receiveApproval caller");

        address delegateKeyFromBytes = extraData.toAddress(12);
        address bootyBaseFromBytes = extraData.toAddress(44);
        uint256 periodFromBytes = extraData.toUint(64);

        emit ReceiveApprovalEvent(from, tokenContract);

        doStake(from, amount, periodFromBytes, delegateKeyFromBytes, bootyBaseFromBytes);
        return true;
    }
```

#### doStake

```
    /**
     * @notice Internal function called from `stake` and `receiveApproval` to perform the actual staking logic.
     *
     * Creates a new staking position for the `stakerAddress`. If this is the first stake in the SpankBank for the given address,
     * a new `Staker` is automatically registered using the provided delegateKey and bootyBase parameters. Otherwise, if the address is
     * a known staker, these parameters are ignored.
     * 
     * The new stake's `expirationTime` is set as a multiple of `stakePeriods` * `periodLength` from `now`. This means each stake
     * is committed for full periods, but it can be withdrown at the same relative position to the period's start/end as when the stake
     * was created.
     * Example: A stake created 3 days and 45 minutes before the end of period 69 and staked for 4 periods expires in period 73 and
     * can be withdrown exactly 3 days and 45 minutes before the end of period 73.
     * 
     * After the stake is created, its points for the current period are calculated and immediately applied, effectively
     * performing a check-in, so that the staker is not required to do this in a separate transaction. Due to the automatic check-in,
     * the staker must wait until the next period before `splitStake` or `increaseStake` can be called.
     * 
     * Important: Approval for the transfer of SPANK from the SPANK token contract into the SpankBank is assumed to have been provided
     * prior to calling this function, otherwise the transaction will fail!
     * 
     * 1. Updates the period.
     * 2. Creates a new `Staker` and updates the `stakerByDelegateKey` table, if this is a previously unknown staker address.
     * 3. Transfers SPANK from the staker to the SpankBank.
     * 4. Creates a new `Stake` struct and sets the expirationTime
     * 5. Calculates and saves the `spankPoints` for the current period.
     * 6. Adds the stake's `spankpoints` to the `totalSpankPoints` for this period.
     * 7. Updates the `totalSpankStaked` in the bank.
     *
     * Reverts if
     * - stakePeriods is outside of allowed range [1-maxPeriods]
     * - spankAmount is zero
     * - the transfer of Spank tokens into the SpankBank fails
     * - delegateKey is zero address (only for new staker address)
     * - bootyBase is zero address (only for new staker address)
     * - delegateKey is already used (only for new staker address)
     *
     * @param stakerAddress - the owner of the stake
     * @param spankAmount - amount of Spank to stake
     * @param stakePeriods - number of periods to stake initially
     * @param delegateKey - the address permitted to act as delegate of the calling Staker (optional, if staker already registered)
     * @param bootyBase - the address to which claimed booty is sent (optional, if staker already registered)
     */
    function doStake(address stakerAddress, uint256 spankAmount, uint256 stakePeriods, address delegateKey, address bootyBase) internal {
        updatePeriod();

        require(stakePeriods > 0 && stakePeriods <= maxPeriods, "stake not between zero and maxPeriods"); // stake 1-12 (max) periods
        require(spankAmount > 0, "stake is 0"); // stake must be greater than 0

        // transfer SPANK to this contract - assumes sender has already "allowed" the spankAmount
        require(spankToken.transferFrom(stakerAddress, this, spankAmount));

        // a Staker cannot exist without at least one stake, so we use that to detect if a new Staker needs to be created
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
        stakes[stakeId] = Stake(stakerAddress, spankAmount, now + (stakePeriods * periodLength), 0);

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
```

### checkIn

The motivation for requiring check ins was to avoid iterating over an array of stakers in order to calculate the `totalSpankPoints` at the time of minting. At best, this would be expensive for whoever calls `mintBooty`, and at worst it presents an incentive for a malicious actor to create many small staking positions to make iterating over them even more expensive. This would either force us to enforce minimum stake SPANK amounts or rewrite `mintBooty` to be able to be called over several transactions so that the gas cost exceeding the block gas limit doesn't prevent the function from being called.

Another reason for requiring check ins is to address the possibility of stakers losing their keys or going permanently offline (e.g. death), in which case we would prefer their share of newly minted BOOTY to be distributed to the remaining stakers.

```
    /**
     * @notice In order to receive Booty, each staker must check in once per period to establish one's eligibility to receive BOOTY for the current period on
     * one or more stakes, i.e. BOOTY that will be minted and can be claimed in the next period.
     * This check-in will compute and update the spankPoints for the current period for all specified stakes as well as the totalSpankPoints in the SpankBank.
     * For each check-in, the stake can optionally be extended by a number of additional periods on top of what is still committed,
     * but not exceeding the `maxPeriods`.
     * If a staker fails to check in for a period, they will not be able to receive any BOOTY minted in the next period. Failure to check in for one period does not, however,
     * prevent the staker from checking in for subsequent periods.
     * 
     * Usage example:
     * - Staker has multiple stakes.
     * - Calling `checkIn(["0x123456","0x1a2b3c"], [2,0])` will perform a check-in on the stakes with the given bytes32 IDs and extends the first stake's expirationTime by an additional 2 periods.
     * 
     * For each of the provided stakes, this function
     * 1. If `additionalPeriods` is provided, updates the `stake.expirationTime`.
     * 2. Calculates and saves the `stake.spankPoints` for the this period.
     * 3. Adds the `stake.spankpoints` to the `totalSpankPoints` for this period and saves it.
     *
     * Reverts if:
     * - a stake is empty, e.g. because it's been withdrawn or it does not exist
     * - the caller is not the owner of the stake or delegate of the staker
     * - a stake has expired or expires in the current period
     * - a stake has already been applied to the current period (e.g. via checkIn or stake)
     * - an update for a stake's expirationTime is not within the maxPeriods limit from `now`, i.e. the `additionalPeriods` value is too high
     *
     * @param stakeIds - an array of Stake IDs for which the staker would like to check in
     * @param additionalPeriods - an array of numbers linked via index to the stakeIds array. A non-zero value indicates to extend the corresponding stake by that number of periods.
     */
    function checkIn(bytes32[] stakeIds, uint256[] additionalPeriods) SpankBankIsOpen public {
        updatePeriod();

        address stakerAddress =  stakerByDelegateKey[msg.sender];
        Staker storage staker = stakers[stakerAddress];

        for (uint256 i = 0; i < stakeIds.length; i++) {
            Stake storage stk = stakes[stakeIds[i]];
            require(stk.spankStaked > 0, "stake is zero");
            require(stk.owner == stakerAddress, "stake has different owner");
            // can only check-in, if the stake expiration is at least one period away, i.e. stake does not expire in the current period
            require(stk.expirationTime > periods[currentPeriod].endTime, "stake has expired");
            require(stk.lastAppliedToPeriod < currentPeriod, "cannot check-in twice for the same stake and period");
            // If 0, don't extend the staked periods
            if (additionalPeriods[i] > 0) {
                // it is not necessary to check that the additionalPeriods value is <= maxPeriods, because if it is not, the newExpirationTime will be rejected
                uint256 newExpirationTime = SafeMath.add(stk.expirationTime, (additionalPeriods[i] * periodLength));
                // cannot extend stake beyond the maxPeriods allowed as seen from the current period
                require(newExpirationTime <= periods[currentPeriod].endTime + (maxPeriods * periodLength), "additionalPeriods greater than maxPeriods");
                stk.expirationTime = newExpirationTime;
            }
            _applyStakeToCurrentPeriod(stakeIds[i]);
            emit CheckInEvent(stakeIds[i], stakerAddress, currentPeriod, staker.spankPoints[currentPeriod], stk.expirationTime);
        }
    }
```

### sendFees

```
    /**
     * @notice Used to report fees for the current period by transferring the specified amount of Booty from the msg.sender into the SpankBank.
     * The fees are burnt immediately and added to the fees of this period which will affect the calculation upon calling mintBooty() in the following period.
     * 
     * This function
     * 1. Updates the period.
     * 2. Transfers `bootyAmount` BOOTY from the msg.sender to the SpankBank.
     * 3. Burns the BOOTY.
     * 4. Adds the `bootyAmount` to the `period.bootyFees` for the current period.
     *
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
```

### mintBooty

```
    /**
     * @notice Performs the minting process for the last period by calculating, based on last period's fees,
     * if new BOOTY must be minted. This is done by checking the current BOOTY supply against the target supply and, if the
     * current supply is lower than the target (20 * last period's `bootyFees`), the SpankBank mints the necessary amount
     * of BOOTY to reach the target which is then claimable by eligible stakers.
     *
     * This function
     * 1. Updates the period.
     * 2. Sets `period.mintingComplete = true` to prevent double minting for a period.
     * 3. If the `targetBootySupply` (20x `bootyFees`) is less than the total BOOTY supply, mints enough BOOTY to reach the `targetBootySupply`.
     * 4. Saves the amount of BOOTY minted to `period.bootyMinted`.
     *
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
        uint256 totalBootySupply = bootyToken.totalSupply();

        if (targetBootySupply > totalBootySupply) {
            uint256 bootyMinted = targetBootySupply - totalBootySupply;
            bootyToken.mint(this, bootyMinted);
            period.bootyMinted = bootyMinted;
            emit MintBootyEvent(targetBootySupply, totalBootySupply);
        }
    }
```

### claimBooty

```
    /**
     * @notice Performs a withdrawal of all booty the staker has accumulated over the specified periods.
     * Used by stakers to withdraw their share of the BOOTY minted for one or more previous periods.
     * Stakers are allowed to be lazy and store their BOOTY with the SpankBank indefinitely until they are ready to claim it in a single transaction.
     *
     * All periods being claimed must meet eligibility requirements or the transaction will revert.
     * This function can be called from a staker's delegate address.
     *
     * This function
     * 1. Updates the period.
     * 2. For each specified Period p sets the `staker.didClaimBooty[p] = true` to prevent double BOOTY claims for a period.
     * 3. For each specified Period aggregates the staker's share of the BOOTY minted for the period into totalBootyOwed
     * 4. Finally, transfers the totalBootyOwed to the staker's bootyBase address
     *
     * This function will only succeed if the conditions for claiming are met for ALL of the specified periods!
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
```

### withdrawStake

```
    /**
     * @notice Withdraws the staked Spank from the specified stakes, if they are eligible for withdrawal, i.e. either after the stakes have expired
     * or the SpankBank was closed via `voteToClose`.
     * Stakes expire after a multiple of `stakePeriods` * `periodLength` from their creation time have passed. This means each stake
     * is committed for full periods, but it can be withdrown at the same relative position to the period's start/end as when the stake
     * was created.
     * Example: A stake created 3 days and 45 minutes before the end of period 69 and staked for 4 periods expires in period 73 and
     * can be withdrown exactly 3 days and 45 minutes before the end of period 73.
     *
     * This function must be called from the original address that created the stake!
     *
     * This function
     * 1. Updates the period
     * 1. For each specified stake sets the `stake.spankStaked = 0` to prevent withdrawing excess SPANK.
     * 2. For each specified stake aggregates the staked SPANK in spankToWithdraw.
     * 4. Finally, transfers the spankToWithdraw
     *
     * This function will only succeed if the conditions for withdrawal are met for ALL of the specified stakes!
     * Reverts if
     * - stake is empty, e.g. because it's been withdrawn or it does not exist
     * - caller is not the original staker
     * - the stake's exact expiration time has not been reached yet
     * 
     * @param stakeIds an array of Stake IDs for which the stake should be withdrawn
     */
    function withdrawStake(bytes32[] stakeIds) public {
        updatePeriod();

        Staker storage staker = stakers[msg.sender];

        uint256 spankToWithdraw = 0;
        for (uint256 i = 0; i < stakeIds.length; i++) {
            Stake storage stk = stakes[stakeIds[i]];
            require(isClosed || now > stk.expirationTime, "spankbank not closed or stake not expired");
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
```

### splitStake

```
    /**
     * @notice Splits the given stake by transfering the specified spankAmount into a new stake for the designated
     * staker. Used by stakers to transfer a portion of an existing stake into a new stake.
     * The created stake will inherit the starting and ending period attributes of the source stake.
     * This function can only be called by the original staker and only for stakes that have not received a check-in
     * for the current period as otherwise points were already applied based on the current size of the stake.
     * 
     * If the receiving staker is previously unknown, a new staker will automatically be registered using
     * the delegateKey and bootyBase parameters; for an existing staker, these parameters are optional.
     * 
     * Note: Unlike the `stake` function, there is no automatic check-in. In order to generate points for the current period,
     * the new staker still has to perform a check-in on the new stake after the split!
     * 
     * The motivation for `splitStake` is primarily to allow stakers to be able to decide to extend less than their total stake when
     * they check in. Without `splitStake`, stakers would be forced during every check in to have to decide to either extend their
     * entire stake or not. If a staker wanted to, for example, extend 90% of their stake but let 10% gradually expire, they wouldn't 
     * be able to. They would have to decide to either extend 100% of their stake or let 100% of their stake gradually expire.
     * To get around this limitation, stakers would likely split their stakes up to be controlled by multiple addresses, so they could
     * decide whether or not to extend each staking position independently. This would make staking more annoying and require unnecessary
     * upfront planning. The `splitStake` function gives stakers more flexibility in deciding how much of their stake to extend over time,
     * and reduces friction from the initial staking.
     * 
     * 1. Updates the period.
     * 2. Subtracts the `spankAmount` to split from original stake
     * 3. Creates a new `Staker` if the `newAddress` is a previously unknown staker
     * 4. Creates a new `Stake` for the new staker with the split `spankAmount` and sets the
     *    same `startingPeriod` and `endingPeriod` as the original stake.
     * 5. Adjusts the `totalSpank` amounts for each staker
     *
     * Reverts if
     * - newAddress is zero address
     * - spankAmount is zero
     * - Spank in the stake is less than split amount
     * - stake was not applied to the current period, yet (checked-in)
     * - stake has expired or expires in the current period
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
        require(sourceStake.spankStaked >= spankAmount, "staked amount too low for split");
        require(sourceStake.owner == msg.sender, "stake has different owner");
        require(sourceStake.expirationTime > periods[currentPeriod].endTime, "stake has expired");
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
        stakes[newStakeId] = Stake(newAddress, spankAmount, sourceStake.expirationTime, 0);

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
```

### increaseStake

```
    /**
     * @notice Adds the specified amount to the given stake.
     * This function allows stakers to increase one of their owned stakes ahead of a checkIn to increase the spankPoints the stake will generate.
     * The parameters of the stake don't change, i.e. the endingTime does not change, the staker simply increases the amount of Spank committed
     * in the stake.
     * 
     * This function
     * 1. Updates the period
     * 2. Transfers the `increaseAmount` from the msg.sender to the bank
     * 3. Adds the increaseAmount to the stake
     * 4. Adjusts the staker's `totalSpank`
     * 5. Adjusts the bank's `totalSpankStaked`
     *
     * Reverts if
     * - the specified increase is 0
     * - the transfer of Spank tokens into the SpankBank fails
     * - the stake has expired or expires in the current period
     * - the stake was already applied to the current period (via checkIn or stake)
     *
     * @param stakeId - the stake to increase
     * @param increaseAmount - the amount of SPANK to add to the stake
     */
    function increaseStake(bytes32 stakeId, uint256 increaseAmount) public {
        updatePeriod();

        require(increaseAmount > 0, "increaseAmount is zero");
        Stake storage stk = stakes[stakeId];
        require(stk.owner == msg.sender, "stake has different owner");
        require(stk.expirationTime > periods[currentPeriod].endTime, "stake has expired");
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
```

### voteToClose

```
    /**
     * @notice Records a vote for the msg.sender in favor of closing the SpankBank. In order to be eligible to add a vote,
     * stakers must have at least one active stake, i.e. a stake that is not expired with a non-zero amount at stake.
     * 
     * Used by stakers to close the SpankBank and be able to withdraw early (e.g. in case of catastrophic bug or planned upgrade).
     * If stakers accounting for more than 50% of the staked SPANK call `voteToClose` in the same period, the SpankBank will
     * immediately transition to a "closed" state and allow stakers to withdraw early.
     * 
     * This function
     * 1. Adds the staker's `totalSpank` to `period.closingVotes`.
     * 2. If `period.closingVotes` is over 50% of the `totalSpankStaked`, sets `isClosed` to true.
     * 3. Marks the staker as having `votedToClose` for the current period
     * 
     * Note: there is a (resolvable) deadlock hidden in this function: If a > 50% majority of staked SPANK is in expired stakes that
     * were not withdrawn yet, it would prevent all active stakers from reaching a majority vote as expired (but not withdrawn) stakes
     * still count towards the `totalSpankStaked` of the bank. Such an impasse can be resolved by enough stakers withdrawing expired
     * stakes or new stakers opening new stakes to increase the voting shares of active stakes.
     * 
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
        uint256 periodEndTime = periods[currentPeriod].endTime;
        // this is the only loop over a growing array in the bank, but it should be ok since it aborts looping as soon as one active stake is found
        for (uint256 i = 0; i < staker.stakes.length; i++) {
            if(periodEndTime < stakes[staker.stakes[i]].expirationTime && stakes[staker.stakes[i]].spankStaked > 0) {
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
```

### updateDelegateKey

```
    /**
     * @notice Updates the delegateKey associated with the msg.sender staker to the specified one.
     * Used by a staker to update the `delegateKey` account which they use to `checkIn` and `claimBooty`.
     * 
     * This function
     * 1. Resets the value of `stakerByDelegateKey` for the previous `delegateKey` to the default zero address.
     * 2. Sets `staker.delegateKey` to the new `delegateKey`.
     * 3. Sets the value of `stakerByDelegateKey` for the new `delegateKey` to the `staker.address`.
     *
     * Reverts if:
     * - newDelegateKey is zero address
     * - newDelegateKey is already in use
     * - the staker (msg.sender) does not exist
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
```
### updateBootyBase

```
    /**
     * @notice Updates the bootyBase associated with the msg.sender staker to the specified one.
     * Used by a staker to update the `bootyBase` account at which they receive the BOOTY they claim.
     * 
     * Reverts if:
     * - the staker (msg.sender) does not exist
     *
     * @param newBootyBase - the new delegateKey
     */
    function updateBootyBase(address newBootyBase) public {
        Staker storage staker = stakers[msg.sender];
        require(staker.stakes.length > 0, "staker does not exist");

        staker.bootyBase = newBootyBase;

        emit UpdateBootyBaseEvent(msg.sender, newBootyBase);
    }
```

## Testing + Development

For testing instructions, see `test/Readme.md`
