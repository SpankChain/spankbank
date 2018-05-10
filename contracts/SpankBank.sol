pragma solidity 0.4.23;
import {SafeMath} from './SafeMath.sol';
import {HumanStandardToken} from './HumanStandardToken.sol';
import {MintableToken} from './MintableToken.sol';

contract SpankBank {

  /***********************************
  VARIABLES SET AT CONTRACT DEPLOYMENT
  ************************************/
  // ADDRESSES DEFINED AT DEPLOYMENT
  address public spankAddress;

  // GLOBAL CONSTANT VARIABLES
  uint256 public periodLength; // time length of each period in seconds
  uint256 public maxPeriods;

  // ERC-20 BASED TOKEN WITH SOME ADDED PROPERTIES FOR HUMAN READABILITY
  // https://github.com/ConsenSys/Tokens/blob/master/contracts/HumanStandardToken.sol
  HumanStandardToken public spankToken;
  MintableToken public bootyToken;

  // LOOKUP TABLE FOR SPANKPOINTS BY PERIOD
  // 1 -> 40%
  // 2 -> 45%
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
    mapping(uint256 => bool) didClaimBooty;
  }

  mapping(address => Staker) public stakers;

  struct Period {
    uint256 bootyFees;
    uint256 totalSpankPoints; // the total spankPoints of all stakers per period
    uint256 bootyMinted;
    bool mintingComplete;
    uint256 startTime;
    uint256 endTime;
  }

  mapping(uint256 => Period) public periods;

  function SpankBank (
    address _spankAddress,
    uint256 _periodLength,
    uint256 _maxPeriods,
    uint256 initialBootySupply
  ) {
    spankAddress = _spankAddress;
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

  // Used to create a new staking position - verifies that the caller is not staking
  function stake(uint256 spankAmount, uint256 stakePeriods) {
    updatePeriod();

    require(stakePeriods > 0 && stakePeriods <= maxPeriods); // stake 1-12 (max) periods
    require(spankAmount > 0); // stake must be greater than 0

    // the msg.sender must not have an active staking position
    require(stakers[msg.sender].startingPeriod == 0 && stakers[msg.sender].endingPeriod == 0);

    // transfer SPANK to this contract - assumes sender has already "allowed" the spankAmount
    require(spankToken.transferFrom(msg.sender, this, spankAmount));

    // The spankAmount of spankPoints the user will have during the next staking period
    uint256 nextSpankPoints = SafeMath.div( SafeMath.mul(spankAmount, pointsTable[stakePeriods]), 100 );

    stakers[msg.sender] = Staker(spankAmount, currentPeriod + 1, currentPeriod + stakePeriods);

    stakers[msg.sender].spankPoints[currentPeriod + 1] = nextSpankPoints;

    uint256 nextTotalSpankPoints = periods[currentPeriod + 1].totalSpankPoints;
    nextTotalSpankPoints = SafeMath.add(nextTotalSpankPoints, nextSpankPoints);
    periods[currentPeriod + 1].totalSpankPoints = nextTotalSpankPoints;
  }

  function getSpankPoints(address stakerAddress, uint256 period) returns (uint256) {
    return stakers[stakerAddress].spankPoints[period];
  }

  function getDidClaimBooty(address stakerAddress, uint256 period) returns (bool) {
    return stakers[stakerAddress].didClaimBooty[period];
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

  function sendFees(uint256 bootyAmount) {
    updatePeriod();

    require(bootyAmount > 0); // fees must be greater than 0
    require(bootyToken.transferFrom(msg.sender, this, bootyAmount));

    bootyToken.burn(bootyAmount);

    uint256 currentBootyFees = periods[currentPeriod].bootyFees;
    currentBootyFees = SafeMath.add(bootyAmount, currentBootyFees);
    periods[currentPeriod].bootyFees = currentBootyFees;
  }

  function mintBooty() {
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

  // This will check the current time and update the current period accordingly
  // - called from all write functions to ensure the period is always up to date before any writes
  // - can also be called externally, but there isn't a good reason for why you would want to
  // - the while loop protects against the edge case where we miss a period

  function updatePeriod() {
    while (now >= periods[currentPeriod].endTime) {
      Period memory prevPeriod = periods[currentPeriod];
      currentPeriod += 1;
      periods[currentPeriod].startTime = prevPeriod.endTime;
      periods[currentPeriod].endTime = SafeMath.add(prevPeriod.endTime, periodLength);
    }
  }

  // In order to receive Booty, each staker will have to check-in every period.
  // This check-in will compute the spankPoints locally and globally for each staker.
  function checkIn(uint256 updatedEndingPeriod) {
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

  function claimBooty(uint256 _period) {
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

  function withdrawStake() {
    updatePeriod();

    Staker storage staker = stakers[msg.sender];

    require(currentPeriod > staker.endingPeriod);

    spankToken.transfer(msg.sender, staker.spankStaked);

    staker.spankStaked = 0;
  }

  // TODO as-is, the contract doesnt allow for dynamic stake allocation - you can only extend
  // the entire stake, or withdraw the entire stake. Even if you could withdraw partial stake,
  // you would still be making the decision to extend the entire stake, or not.
  // - allow staker to split stake (or move some fraction under a new address)
  // - accept that you have to extend the entire stake, and plan ahead accordingly
  //   - split the stake up into several portions, and decide to extend / not each portion
}
