# SpankBank

The SpankBank is an algorithmic central bank that powers the two-token SpankChain economic system.

1. SPANK is a staking token which can be deposited with the SpankBank to earn newly minted BOOTY.

2. BOOTY is low-volatility fee credit good for $1 worth of SpankChain services.

SpankChain will collect fees for using the camsite, payment hub, advertising network, and other services in BOOTY. The fees are sent to the SpankBank where they are counted and burned.

The SpankBank has a 30 day billing period. At the beginning of each new period, if the total BOOTY supply is under the target supply (20x the total fees collected in the previous period), new BOOTY is minted to reach the target supply and distributed proportionally to all SPANK stakers.

In the future, we plan to add features to incentivize decentralized moderation of the SpankChain platform, rewarding BOOTY to those who help maintain its integrity. We also plan to add mechanisms that will incentivize maintaining the $1 BOOTY peg.

## Usage

SPANK holders can stake their SPANK tokens with the SpankBank for up to 12 (30 day) periods by calling the `stake` function. BOOTY fees can be paid to the SpankBank by anyone by calling the `sendFees` function. When a new period starts, anyone can mint BOOTY for the previous period by calling the `mintBooty` function. Once BOOTY has been minted for a period, the stakers for that period can call the `claimBooty` function to claim their BOOTY. In order to be eligible to receive BOOTY, during each staking period stakers have to check in with the SpankBank by calling the `checkIn` function. Stakers can optionally extend their stake for additional periods when checking in. When a staker's stake has expired, they can withdraw their staked SPANK using the `withdrawStake` function.

If stakers want to only partially extend their stake (e.g. extend only 50% of their stake by an additional month, not all of it) or to transfer some of their stake to a new address (e.g. for security reasons) they can do so by calling the `splitStake` function.

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
In order to earn the maximum BOOTY, a staker would need to stake for 12 periods, and then opt to extend their stake by 1 period during every check in.

If a staker stakes for 12 periods but doesn't opt to extend their stake during check ins, they would receive 100% of the BOOTY for the first period, 95% for the second period, and so forth until they receive 45% during the final period.

#### Internal Accounting

`uint256 public currentPeriod = 0;` - the current period number

##### Stakers

The `Staker` struct stores all releveant data for each staker, and is saved in the `stakers` mapping by the staker's address.

```
  struct Staker {
    uint256 spankStaked; // the amount of spank staked
    uint256 startingPeriod; // the period this staker started staking (e.g. 1)
    uint256 endingPeriod; // the period after which this stake expires (e.g. 12)
    mapping(uint256 => uint256) spankPoints; // the spankPoints per period
    mapping(uint256 => bool) didClaimBooty; // true if staker claimed BOOTY for that period
  }

  mapping(address => Staker) public stakers;
```
The `staker.spankPoints` mapping stores the staker's spank points for each period. The `staker.didClaimBooty` mapping tracks whether or not the staker has claimed their BOOTY for each period.

##### Periods

The `Period` struct stores all releveant data for each period, and is saved in the `periods` mapping by the period number.
```
  struct Period {
    uint256 bootyFees; // the amount of BOOTY collected in fees
    uint256 totalSpankPoints; // the total spankPoints of all stakers
    uint256 bootyMinted; // the amount of BOOTY minted
    bool mintingComplete; // true if BOOTY has already been minted for this period
    uint256 startTime; // the starting unix timestamp in seconds
    uint256 endTime; // the ending unix timestamp in seconds
  }

  mapping(uint256 => Period) public periods;
```
The data for each period is set in the following order:

1. The `totalSpankPoints` are tallied during the previous period, as each staker calls the `stake` or `checkIn` functions.
2. The `startTime` and `endTime` are set when the period starts, when the `updatePeriod` function is called.
3. The `bootyFees` are tallied during the period, as the `sendFees` function is called.
4. Once the period is over, `bootyMinted` and `mintingComplete` are set when the `mintBooty` function is called.

## Functions

#### SpankBank Constructor

1. Saves the passed in `periodLength` and `maxPeriods` as global constants.
2. Builds and saves the SPANK token reference from the passed in `spankAddress`.
3. Deploys the BOOTY token contract and mints `initialBootySupply` BOOTY tokens.
4. Transfers all newly minted BOOTY to the `msg.sender`.
5. Immediately starts the first period (period 0) at `startTime = now`.
6. Set the `endTime` of the first period to 30 days from `now`.
7. Initialize the `pointsTable` with hard coded values.
```
  function SpankBank (
    address spankAddress,
    uint256 _periodLength,
    uint256 _maxPeriods,
    uint256 initialBootySupply
  )  public {
    periodLength = _periodLength;
    spankToken = HumanStandardToken(spankAddress);
    bootyToken = new MintableToken();
    bootyToken.mint(this, initialBootySupply);
    maxPeriods = _maxPeriods;

    uint256 startTime = now;

    periods[currentPeriod].startTime = startTime;
    periods[currentPeriod].endTime = SafeMath.add(startTime, periodLength);

    bootyToken.transfer(msg.sender, initialBootySupply);

    // initialize points table
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
```

#### updatePeriod

In order to make sure all interactions with the SpankBank take place during the correct period, the `updatePeriod` function is called at the beginning of every state-updating function.

So long as the current time (`now`) is greater than the `endTime` of the current period (meaning the period is over), the `currentPeriod` is incremented by one and then the `startTime` and the `endTime` for the next `Period` are set as well.

```
  function updatePeriod() public {
    while (now >= periods[currentPeriod].endTime) {
      Period memory prevPeriod = periods[currentPeriod];
      currentPeriod += 1;
      periods[currentPeriod].startTime = prevPeriod.endTime;
      periods[currentPeriod].endTime = SafeMath.add(prevPeriod.endTime, periodLength);
    }
  }
```
The reason this is done using a `while` loop is just in case an entire period passes without any SpankBank interactions taking place. This is extremely unlikely and would mean no fees were paid not a single staker checked in, but we wanted to protect against that scenario anyways.

One scenario the `updatePeriod` function does not protect against is if enough periods pass without any SpankBank interactions that in order to catch up to the current period the `while` loop has to run enough times that its execution uses more gas than the gas limit of a single block. The `updatePeriod` function uses 21272 gas so at the current 8M gas limit it would take 31 years of not interacting with the `SpankBank` for this to happen.

#### stake

Used to open a new staking position with `spankAmount` SPANK tokens for a length of `stakePeriods` periods.

1. Updates the period.
3. Transfers SPANK from the staker to the SpankBank.
4. Calculates and saves the `staker.spankPoints` for the next period.
5. Adds the `staker.spankpoints` to the `totalSpankPoints` for the next period and saves it.

```
  function stake(uint256 spankAmount, uint256 stakePeriods) public {
    updatePeriod();

    require(stakePeriods > 0 && stakePeriods <= maxPeriods); // stake 1-12 (max) periods
    require(spankAmount > 0); // stake must be greater than 0

    // the msg.sender must not have an active staking position
    // TODO checking that endingPeriod == 0 should cover all periods
    require(stakers[msg.sender].startingPeriod == 0 && stakers[msg.sender].endingPeriod == 0);

    // transfer SPANK to this contract - assumes sender has already "allowed" the spankAmount
    require(spankToken.transferFrom(msg.sender, this, spankAmount));

    // The spankAmount of spankPoints the user will have during the next staking period
    // TODO the division is unnecessary - we're only dividing by the total
    uint256 nextSpankPoints = SafeMath.div( SafeMath.mul(spankAmount, pointsTable[stakePeriods]), 100 );

    stakers[msg.sender] = Staker(spankAmount, currentPeriod + 1, currentPeriod + stakePeriods);

    stakers[msg.sender].spankPoints[currentPeriod + 1] = nextSpankPoints;

    uint256 nextTotalSpankPoints = periods[currentPeriod + 1].totalSpankPoints;
    nextTotalSpankPoints = SafeMath.add(nextTotalSpankPoints, nextSpankPoints);
    periods[currentPeriod + 1].totalSpankPoints = nextTotalSpankPoints;
  }
```

#### sendFees

Used to send `bootyAmount` BOOTY tokens in fees to the SpankBank, which are then counted and burned.

1. Updates the period.
2. Transfers `bootyAmount` BOOTY from the sender to the SpankBank.
3. Burns the BOOTY.
4. Adds the `bootyAmount` to the `period.bootyFees` for the current period.

```
  function sendFees(uint256 bootyAmount) public {
    updatePeriod();

    require(bootyAmount > 0); // fees must be greater than 0
    require(bootyToken.transferFrom(msg.sender, this, bootyAmount));

    bootyToken.burn(bootyAmount);

    uint256 currentBootyFees = periods[currentPeriod].bootyFees;
    currentBootyFees = SafeMath.add(bootyAmount, currentBootyFees);
    periods[currentPeriod].bootyFees = currentBootyFees;
  }
```

#### mintBooty

Used to mint new BOOTY based on the total fees from the previous period.

1. Updates the period.
2. Sets `period.mintingComplete = true` to prevent double minting for a period.
3. If the `targetBootySupply` (20x `bootyFees`) is less than the total BOOTY supply, mints enough BOOTY to reach the `targetBootySupply`.
4. Saves the amount of BOOTY minted to `period.bootyMinted`.

```
  function mintBooty() public {
    updatePeriod();

    Period storage period = periods[currentPeriod - 1];
    require(!period.mintingComplete); // cant mint BOOTY twice

    period.mintingComplete = true;

    uint256 targetBootySupply = SafeMath.mul(period.bootyFees, 20);
    uint256 totalBootySupply = bootyToken.totalSupply();

    if (targetBootySupply > totalBootySupply) {
      uint256 bootyMinted = targetBootySupply - totalBootySupply;
      bootyToken.mint(this, bootyMinted);
      period.bootyMinted = bootyMinted;
    }
  }
```

If `mintBooty` is skipped for a period, the impact would be that the stakers for that period would not receive their BOOTY, which would especially hurt stakers that are exiting after that period. Overall, the impact would be minimal, as any reduction in the total BOOTY supply would be made up when `mintBooty` was called during the next period.

#### claimBooty

Used by stakers to withdraw their share of the BOOTY minted for a previous period.

1. Updates the period.
2. Sets the `staker.didClaimBooty = true` to prevent double BOOTY claims for a period.
3. Calculates the staker's share of the BOOTY minted for the period and transfers it from the SpankBank to the staker.
```
  function claimBooty(uint256 _period) public {
    updatePeriod();

    require(_period < currentPeriod); // can only claim booty for previous periods

    Staker storage staker = stakers[msg.sender];

    require(!staker.didClaimBooty[_period]); // can only claim booty once

    staker.didClaimBooty[_period] = true;

    Period memory period = periods[_period];
    uint256 bootyMinted = period.bootyMinted;
    uint256 totalSpankPoints = period.totalSpankPoints;

    if (totalSpankPoints > 0) {
      uint256 stakerSpankPoints = staker.spankPoints[_period];
      uint256 bootyOwed = SafeMath.div(SafeMath.mul(stakerSpankPoints, bootyMinted), totalSpankPoints);

      require(bootyToken.transfer(msg.sender, bootyOwed));
    }
  }
```

Because `claimBooty` accepts a period to retrieve BOOTY for, it allows for stakers to be lazy and store their BOOTY with the SpankBank indefinitely until they are ready to withdraw.

#### checkIn

Used by stakers to establish their eligibility for receiving BOOTY for the next period. Can also optionally extend the staker's `endingPeriod`.

1. Updates the period.
3. If an `updatedEndingPeriod` is provided, updates `staker.endingPeriod`.
4. Calculates and saves the `staker.spankPoints` for the next period.
5. Adds the `staker.spankpoints` to the `totalSpankPoints` for the next period and saves it.

```
  function checkIn(uint256 updatedEndingPeriod) public {
    updatePeriod();

    Staker storage staker = stakers[msg.sender];

    require(currentPeriod < staker.endingPeriod);

    if (updatedEndingPeriod > 0) {
      // TODO I'm not sure we can rely on the staker.endingPeriod to be greater than the
      // currentPeriod - what if the staker expires but never withdraws their stake?
      require(updatedEndingPeriod > currentPeriod);
      require(updatedEndingPeriod > staker.endingPeriod);
      require(updatedEndingPeriod <= currentPeriod + maxPeriods);

      staker.endingPeriod = updatedEndingPeriod;
    }

    uint256 stakePeriods = staker.endingPeriod - currentPeriod;

    // TODO combine this and the code from stake into their own function to reduce dup

    // The spankAmount of spankPoints the user will have during the next staking period
    uint256 nextSpankPoints = SafeMath.div(SafeMath.mul(staker.spankStaked, pointsTable[stakePeriods]), 100);

    staker.spankPoints[currentPeriod + 1] = nextSpankPoints;

    uint256 nextTotalSpankPoints = periods[currentPeriod + 1].totalSpankPoints;
    nextTotalSpankPoints = SafeMath.add(nextTotalSpankPoints, nextSpankPoints);
    periods[currentPeriod + 1].totalSpankPoints = nextTotalSpankPoints;
  }

```

If a staker fails to check in for a period, they will not be able to receive any BOOTY minted for that period. Failing to check in for one period does not, however, prevent the staker from checking in for subsequent periods.

The motivation for requiring check ins was to avoid requiring iterating over an array of stakers in order to calculate the `totalSpankPoints` at the time of minting. At best, this would be expensive for whoever calls `mintBooty`, and at worst, it presents an incentive for a malicious actor to create many small staking positions to make iterating over them even more expensive. This would either force us to enforce minimum stake SPANK amounts or rewrite `mintBooty` to be able to be called over several transactions so that the gas cost exceeding the block gas limit doesn't prevent the function from being called.

Another reason for requiring check ins is to address the possibility of stakers losing their keys or going permanently offline (e.g. death), in which case we would prefer their share of newly minted BOOTY to be distributed to the remaining stakers.

#### withdrawStake

Used by stakers to withdraw their staked SPANK after their stake's `endingPeriod` has passed.

1. Updates the period.
2. Transfers the staked SPANK to the staker.
3. Sets the `staker.spankStaked = 0` to prevent withdrawing excess SPANK.

```
  function withdrawStake() public {
    updatePeriod();

    Staker storage staker = stakers[msg.sender];

    require(currentPeriod > staker.endingPeriod);

    spankToken.transfer(msg.sender, staker.spankStaked);

    staker.spankStaked = 0;
  }
```
It is possible for a staker to call `withdrawStake` multiple times, but because after the first time the `staker.spankStaked` would be zero, future calls would simply transfer zero SPANK to the staker.

#### splitStake

Used by stakers to transfer `spankAmount` of their staked SPANK (up to 100%) to the provided `newAddress`.

1. Updates the period.
2. Subtracts the `spankAmount` to split from `staker.spankStaked`.
3.

```
  function splitStake(address newAddress, uint256 spankAmount) public {
    updatePeriod();

    require(newAddress != address(0));
    require(spankAmount > 0);

    Staker storage staker = stakers[msg.sender];
    require(currentPeriod < staker.endingPeriod);
    require(spankAmount <= staker.spankStaked);
    staker.spankStaked = SafeMath.sub(staker.spankStaked, spankAmount);

    stakers[newAddress] = Staker(spankAmount, staker.startingPeriod, staker.endingPeriod);
  }
```

Questions
What is the purpose of the spankbank?
Refer to whitepaper
How does it work as a user?
How does bootstrapping work?
Design motivations?
Simplicity - less code the better
Legibility - should be easily understood by other developers
CheckIn system
Didn’t want to have a single function which mints booty for everyone
Would need to iterate over all stakers, calculate their spankpoints
This presents an attack vector to fill up the array or make it expensive to iterate through
Would need to be countered by having a minimum spank stake, which we don’t necessarily want
CheckIn allows us to cumulatively calculate the totalSpankPoints, which means we don’t have to store and array and iterate over it
Data Structures
Staker
Represents a staking position
1 account per staking position
spankStaked - the amount of staked spank
startingPeriod - the starting period for this staking position (the period after the stake function was called)
endingPeriod - the ending period for this staking position (can be optionally extended when calling the checkIn function)
Stakers
A mapping of staker addresses to their staking positions
Period
bootyFees - the amount of BOOTY paid in fees
totalSpankPoints - the total spankPoints of all stakers per period
bootyMinted - the amount of BOOTY minted for this period (set when mintBooty is called in the next period)
bool mintingComplete - true if mintBooty has been called for this period
uint256 startTime - the starting time (in unix seconds) of the period - set in update period
uint256 endTime - the ending time (in unix seconds) of the period
Periods - a mapping of period numbers to period structs
Global Parameters
maxPeriods
periodLength
pointsTable
currentPeriod
Contract references
spankToken
bootyToken
Functions
Questions:
Function parameters
How is this function used (in what contexts)
Show example parameters
What does the function do? (what write operations does it perform)
Restrictions on functions usage (when should this not work)
SpankBank (constructor)
Constructor args:
spankAddress - the address of the deployed SPANK token contract
periodLength - the length of the economic cycle, in seconds
maxPeriods - the maximum number of periods a staker can stake in advance (e.g. you can stake for at most 1 year into the future)
initialBootySupply - the amount of BOOTY to be minted initially (it will all be sent to the owner)
Initializes the global parameters (periodLength, maxPeriods)
Stores the reference to the SPANK token contract
Deploys the BOOTY mintable/burnable token contract and stores the reference
Transfers the initial booty supply to the msg.sender
Starts period 0 by setting the start time and end time
Initializes the spankPoints table with hard-coded values
Stake
Used to establish a new staking position
Creates a new staker struct and saves it under the msg.sender address in the stakers mapping
Transfers SPANK tokens from the sender to the SpankBank contract address


updatePeriod
What if no one calls updatePeriod for a long enough time that when it is called, the loop runs out of gas and renders the SpankBank unusable
How long would this actually take? Guess is 100 or so periods
SendFees
mintBooty
What happens if no one calls mintBooty
Not a big deal, because if consumption remains steady, additional booty would be minted during the next period
checkIn
Set spank points for next period
claimBooty
Lazy ClaimBooty works - can get booty for previous periods
withdrawStake
splitStake
While we know this will make it easier to sell staked SPANK positions, we think it will improve the user experience of staking
If we didn’t do this, stakers would always need to keep their entire stake together - they wouldn’t be able to decide, later on after staking, that they only want to 50% of their stake for several more months, and let the rest expire
This uncertainty would make it less likely for people to stake in the first place - which is the opposite of what we want
Alternatively, it would force users to manage multiple stakes and multiple addresses and have to decide in advance how to divide up their stakes - this seems cumbersome and is easily avoided by allowing the user to split their stake later on
This also helps address security issues around staking - if a staker’s account is compromised, we want them to be able to change the address to a new account
This doesn’t work if we don’t allow splitStake after checking in



Meta
Will the documentation include the comments? Seems redundant if it doesn’t



