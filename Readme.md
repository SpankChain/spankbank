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

## Functions

### SpankBank Constructor

1. Saves the provided `periodLength` and `maxPeriods` as global constants.
2. Builds and saves the SPANK token reference from the passed in `spankAddress`.
3. Deploys the BOOTY token contract and mints `initialBootySupply` BOOTY tokens.
4. Transfers all newly minted BOOTY to the `msg.sender`.
5. Immediately starts the first period (period 0) at `startTime = now`.
6. Set the `endTime` of the first period to 30 days from `now`.
7. Initialize the `pointsTable` with hard coded values.
```
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
```

#### Bootstrapping BOOTY

Should the SpankBank have the need to bootstrap an `initialBootySupply`, a value can be provided via the constructor parameter and the minted BOOTY balance is sent to the `msg.sender`.

Additionally, the address of an existing BOOTY token contract can be passed in. This address might stem from a prior SpankBank version that was closed. In this new SpankBank it will be counted when calculating the total circulating supply of BOOTY.

// TODO need to understand how we can bring the old BOOTY contract to xDAI? I assume it's ownership cannot be transfered? There should be a voteToTransfer function to give a closed bank the opportunity to pass ownership of the BOOTY supply!

### updatePeriod

In order to make sure all interactions with the SpankBank take place during the correct period, the `updatePeriod` function is called at the beginning of every state-updating function.

So long as the current time (`now`) is greater than the `endTime` of the current period (meaning the period is over), the `currentPeriod` is incremented by one and then the `startTime` and the `endTime` for the next `Period` are set as well.

```
    function updatePeriod() public {
        while (now >= periods[currentPeriod].endTime) {
            Period memory prevPeriod = periods[currentPeriod];
            emit PeriodEvent(
                currentPeriod,
                prevPeriod.bootyFees,
                prevPeriod.totalSpankPoints,
                prevPeriod.bootyMinted,
                prevPeriod.closingVotes
            );

            currentPeriod += 1;
            periods[currentPeriod].startTime = prevPeriod.endTime;
            periods[currentPeriod].endTime = SafeMath.add(prevPeriod.endTime, periodLength);
        }
    }
```
The reason this is done using a `while` loop is just in case an entire period passes without any SpankBank interactions taking place. This is extremely unlikely and would mean no fees were paid not a single staker checked in, but we wanted to protect against that scenario anyways.

One scenario the `updatePeriod` function does not protect against is if enough periods pass without any SpankBank interactions that in order to catch up to the current period the `while` loop has to run enough times that its execution uses more gas than the gas limit of a single block. The `updatePeriod` function uses 21272 gas so at the current 8M gas limit it would take 31 years of not interacting with the `SpankBank` for this to happen.

### stake

Used to open a new staking position for the caller with `spankAmount` SPANK tokens for a length of `stakePeriods` periods.
The stake is entered on the current period and points are immediately calculated, effectively performing an automatic check-in on the first period.

1. Updates the period.
2. Saves the staker data, if this is a previously unknown staker address.
3. Transfers SPANK from the staker to the SpankBank.
4. Calculates and saves the `staker.spankPoints` for the current period.
5. Adds the `staker.spankpoints` to the `totalSpankPoints` for this period.
6. Updates the `totalSpankStaked`.
7. Updates the `stakerByDelegateKey` lookup table.

Note: In order to improve the UX of staking, we allow the user to combine calling the `approve` function on the SPANK contract and the `stake` function on this contract by calling the `approveAndCall` function on the SPANK contract with the staking parameters. The `approveAndCall` forwards a payload with the staking parameters to the `receiveApproval` function on the SpankBank, which then stakes as usual. To allow for either way of staking, we execute the main staking logic inside the `doStake` function and call it from both `stake` and `receiveApproval`.

```
    function stake(
        uint256 spankAmount,
        uint256 stakePeriods,
        address delegateKey,
        address bootyBase)
    SpankBankIsOpen public {
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
            stakers[stakerAddress] = Spank.Staker(spankAmount, delegateKey, bootyBase, stakeIDs);
        }
        else {
            stakers[stakerAddress].totalSpank = SafeMath.add(stakers[stakerAddress].totalSpank, spankAmount);
        }

        // the new stake ID is generated from the staker address and the position index in the array of stakes
        // this will not cause any hash collisions as long as no stakes are deleted
        bytes32 stakeId = keccak256(abi.encodePacked(stakerAddress, stakers[stakerAddress].stakes.length));
        stakers[stakerAddress].stakes.push(stakeId);
        stakes[stakeId] = Spank.Stake(stakerAddress, spankAmount, currentPeriod, currentPeriod + stakePeriods - 1, 0);

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

#### receiveApproval

As mentioned above, the `receiveApproval` function receives staking parameters as a payload from the `approveAndCall` function on the SPANK token contract when the staker wants to stake in a single transction. This is the default pattern supported by the SpankBank Explorer UI.

```
    function receiveApproval(address from, uint256 amount, address tokenContract, bytes extraData) SpankBankIsOpen public returns (bool success) {
        address delegateKeyFromBytes = extraData.toAddress(12);
        address bootyBaseFromBytes = extraData.toAddress(44);
        uint256 periodFromBytes = extraData.toUint(64);

        emit ReceiveApprovalEvent(from, tokenContract);

        doStake(from, amount, periodFromBytes, delegateKeyFromBytes, bootyBaseFromBytes);
        return true;
    }
```

#### Convenience vs. Security: delegateKey and bootyBase

We expect that stakers will have varying preferences for security vs. convenience, and so we designed the SpankBank to allow stakers to optionally split up responsibilities across multiple accounts. The `delegateKey` is used to `checkIn` and `claimBooty` every month, and the `bootyBase` is where the claimed BOOTY will be deposited. The account originally used to stake (the `staker.address`) must be used to `splitStake`, `withdrawStake`, `voteToClose`, `updateDelegateKey`, and `updateBootyBase`.

Should stakers maximally prefer convenience, they can use the same address for all three and never think about this again. Should stakers maximally prefer security, they could use a multi-sig wallet or hardware wallet to stake, keep that account in cold storage and secure, and only use it as needed (e.g. 1 year later to withdraw). They could then use a second account as the `delegateKey`, which they would keep hot and only use once a month to `checkIn` and `claimBooty`, and use a third account as their `bootyBase`. Splitting up these accounts makes it so that hackers would need to take over both the `delegateKey` and the `bootyBase` in order to steal a staker's BOOTY for the period, at which point the staker could call `updateDelegateKey` and `updateBootyBase` to regain control.

The most important security risk around having a `delegateKey` hacked is that it can be used to `checkIn` and potentially increase the staking period to the maximum, which cannot be undone.

#### Other Considerations

A new stake participates in the current period immediately, no matter how close to the end of the period it's created. It is therefore eligible to claim any BOOTY minted in the next period and awarded according to the stake's points. Because of this, and in order to ensure that a staker completes the promised number of staking periods in full, a stake can only be withdrawn after waiting an additional period after the stake's expiry.

Example:
- Staker creates a stake for 10 periods entering on period 69.
- Stake automatically generates points for the staker for period 69.
- In period 70, the staker can claim minted BOOTY for the first time
- Staker checks in for this stake without extending over the following 9 periods; period 79 being the last one for which the stake will generate points.
- Period 80 is the waiting period and in period 81 the staked SPANK can be withdrawn.

If a staker does not extend the stake during check-in on its final `endingPeriod`, the stake is regarded as expired and can only be withdrawn.

### sendFees

Used to send `bootyAmount` BOOTY tokens in fees to the SpankBank, which are then counted and burned.

1. Updates the period.
2. Transfers `bootyAmount` BOOTY from the sender to the SpankBank.
3. Burns the BOOTY.
4. Adds the `bootyAmount` to the `period.bootyFees` for the current period.

```
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

Used to mint new BOOTY based on the total fees from the previous period.

1. Updates the period.
2. Sets `period.mintingComplete = true` to prevent double minting for a period.
3. If the `targetBootySupply` (20x `bootyFees`) is less than the total BOOTY supply, mints enough BOOTY to reach the `targetBootySupply`.
4. Saves the amount of BOOTY minted to `period.bootyMinted`.

```
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
```
Newly minted BOOTY is owned by the SpankBank contract until it is claimed.

If `mintBooty` is skipped for a period, the impact would be that the stakers for that period would not receive their BOOTY, which would especially hurt stakers that are exiting after that period. Overall, the impact would be minimal, as any reduction in the total BOOTY supply would be made up when `mintBooty` is called during the next period.

### claimBooty

Used by stakers to withdraw their share of the BOOTY minted for one or more previous periods.

For each of the specified periods this function
1. Sets the `staker.didClaimBooty = true` to prevent double BOOTY claims for a period.
2. Calculates the staker's share of the BOOTY minted for the period and transfers it from the SpankBank to the staker.
```
    function claimBooty(uint256[] claimPeriods) public {
        updatePeriod();

        address stakerAddress = stakerByDelegateKey[msg.sender];
        Spank.Staker storage staker = stakers[stakerAddress];
        uint256 totalBootyOwed;
        Spank.Period memory period;
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

Stakers are allowed to be lazy and store their BOOTY with the SpankBank indefinitely until they are ready to withdraw it in one transaction.

### checkIn

Used by stakers to establish their eligibility for one or more stakes to receive BOOTY for the current period, i.e. BOOTY that will be minted in the next period. For each stake, an optional extionsion of the stake's `endingPeriod` can be provided.

For each of the provided stakes, this function
1. If an `updatedEndingPeriod` is provided, updates `staker.endingPeriod`.
2. Calculates and saves the `staker.spankPoints` for the this period.
3. Adds the `staker.spankpoints` to the `totalSpankPoints` for this period and saves it.

```
    function checkIn(uint256 updatedEndingPeriod) SpankBankIsOpen public {
        updatePeriod();

        address stakerAddress =  stakerByDelegateKey[msg.sender];

        Staker storage staker = stakers[stakerAddress];

        require(staker.spankStaked > 0, "staker stake is zero");
        require(currentPeriod < staker.endingPeriod, "staker expired");
        require(staker.spankPoints[currentPeriod+1] == 0, "staker has points for next period");

        // If updatedEndingPeriod is 0, don't update the ending period
        if (updatedEndingPeriod > 0) {
            require(updatedEndingPeriod > staker.endingPeriod, "updatedEndingPeriod less than or equal to staker endingPeriod");
            require(updatedEndingPeriod <= currentPeriod + maxPeriods, "updatedEndingPeriod greater than currentPeriod and maxPeriods");
            staker.endingPeriod = updatedEndingPeriod;
        }

        uint256 stakePeriods = staker.endingPeriod - currentPeriod;

        _updateNextPeriodPoints(stakerAddress, stakePeriods);

        emit CheckInEvent(stakerAddress, currentPeriod + 1, staker.spankPoints[currentPeriod + 1], staker.endingPeriod);
    }
```
If `0` is provided for a stake's `updatedEndingPeriod`, the `stake.endingPeriod` stays the same.

If a staker fails to check in for a period, they will not be able to receive any BOOTY minted in the next period. Failing to check in for one period does not, however, prevent the staker from checking in for subsequent periods.

The motivation for requiring check ins was to avoid requiring iterating over an array of stakers in order to calculate the `totalSpankPoints` at the time of minting. At best, this would be expensive for whoever calls `mintBooty`, and at worst, it presents an incentive for a malicious actor to create many small staking positions to make iterating over them even more expensive. This would either force us to enforce minimum stake SPANK amounts or rewrite `mintBooty` to be able to be called over several transactions so that the gas cost exceeding the block gas limit doesn't prevent the function from being called.

Another reason for requiring check ins is to address the possibility of stakers losing their keys or going permanently offline (e.g. death), in which case we would prefer their share of newly minted BOOTY to be distributed to the remaining stakers.

### withdrawStake

Used by stakers to withdraw their staked SPANK for one or more stakes after their `endingPeriod` has passed or after the SpankBank has been closed via `voteToClose`.

For each of the provided stakes, the function
1. Sets the `stake.spankStaked = 0` to prevent withdrawing excess SPANK.
2. Transfers the staked SPANK to the staker.

```
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
```

### splitStake

Used by stakers to transfer a portion or all of the `spankAmount` in a certain stake
the a provided `newAddress`. Can only be called before the staker checks in for
a period.

1. Updates the period.
2. Subtracts the `spankAmount` to split from `stake.spankStaked`.
3. Creates a new `Staker` if the `newAddress` is a previously unknown staker
4. Creates a new `Stake` for the staker, transfers `spankAmount`, and sets the
   same `startingPeriod` and `endingPeriod` as the original stake.

```
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
            stakers[newAddress] = Spank.Staker(spankAmount, newDelegateKey, newBootyBase, stakeIDs);
            stakerByDelegateKey[newDelegateKey] = newAddress;
        }
        else {
            stakers[newAddress].totalSpank = SafeMath.add(stakers[newAddress].totalSpank, spankAmount);
        }

        bytes32 newStakeId = keccak256(abi.encodePacked(newAddress, stakers[newAddress].stakes.length));
        Spank.Staker storage staker = stakers[msg.sender];
        sourceStake.spankStaked = SafeMath.sub(sourceStake.spankStaked, spankAmount);
        staker.totalSpank = SafeMath.sub(staker.totalSpank, spankAmount);

        stakers[newAddress].stakes.push(newStakeId);
        stakes[newStakeId] = Spank.Stake(newAddress, spankAmount, sourceStake.startingPeriod, sourceStake.endingPeriod, 0);

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

The motivation for `splitStake` is primarily to allow stakers to be able to decide to extend less than their total stake when they check in. Without `splitStake`, stakers would be forced during every check in to have to decide to either extend their entire stake or not. If a staker wanted to, for example, extend 90% of their stake but let 10% gradually expire, they wouldn't be able to. They would have to decide to either extend 100% of their stake or let 100% of their stake gradually expire.

To get around this limitation, stakers would likely split their stakes up to be controlled by multiple addresses, so they could decide whether or not to extend each staking position independently. This would make staking more annoying and require unnecessary upfront planning. The `splitStake` function gives stakers more flexibility in deciding how much of their stake to extend over time, and reduces friction from the initial staking.

### voteToClose

Used by stakers to close the SpankBank and be able to withdraw early (e.g. in case of catastrophic bug or planned upgrade). If stakers accounting for more than 50% of the staked SPANK call `voteToClose` in the same period, the SpankBank will immediately transition to a "closed" state and allow stakers to withdraw early.

1. Adds `staker.totalSpank` to `period.closingVotes`.
2. If `period.closingVotes` is over 50% of the `totalSpankStaked`, sets `isClosed` to true.
```
    function voteToClose() public {
        updatePeriod();

        Spank.Staker storage staker = stakers[msg.sender];

        // voting requires the staker to have at least one active stake
        bool activeStakes = false;
        // this is the only 'growing' loop in the bank, but should be ok since it aborts looping as soon as one active stake is found
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
```

#### Upgrading the SpankBank

We have decided to forego attempting to make the SpankBank directly upgradeable
onchain because of the additional complexity and foresight required today to make the
present SpankBank forward compatible with the next version. Instead, when it is
time to upgrade SpankChain will deploy a new SpankBank smart contract and the
stakers will be able to `voteToClose` the old SpankBank, withdraw their SPANK,
and optionally re-stake in the new SpankBank.

### updateDelegateKey

Used by a staker to update the `delegateKey` account which they use to `checkIn` and
`claimBooty`.

1. Resets the value of `stakerByDelegateKey` for the previous `delegateKey` to
   the default zero address.
2. Sets `staker.delegateKey` to the new `delegateKey`.
3. Sets the value of `stakerByDelegateKey` for the new `delegateKey` to the
   `staker.address`.
```
    function updateDelegateKey(address newDelegateKey) public {
        require(newDelegateKey != address(0), "delegateKey is zero");
        require(stakerByDelegateKey[newDelegateKey] == address(0), "delegateKey already exists");

        Staker storage staker = stakers[msg.sender];
        require(staker.startingPeriod > 0, "staker starting period is zero");

        stakerByDelegateKey[staker.delegateKey] = address(0);
        staker.delegateKey = newDelegateKey;
        stakerByDelegateKey[newDelegateKey] = msg.sender;

        emit UpdateDelegateKeyEvent(msg.sender);
    }
```
### updateBootyBase

Used by a staker to update the `bootyBase` account at which they receive the
BOOTY they claim.

```
    function updateBootyBase(address newBootyBase) public {
        Staker storage staker = stakers[msg.sender];
        require(staker.startingPeriod > 0, "staker starting period is zero");

        staker.bootyBase = newBootyBase;

        emit UpdateBootyBaseEvent(msg.sender);
    }
```

## Testing + Development

For testing instructions, see `test/Readme.md`
