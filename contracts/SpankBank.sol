pragma solidity 0.4.15;
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
  uint256 public periodLength;
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

  // the total spankPoints of all stakers per period
  mapping(uint256 => uint256) totalSpankPoints;

  struct Staker {
    address stakerAddress; // the address of the staker
    uint256 spankStaked; // the amount of spank staked
    uint256 bootyBalance; // the amount of accumulated BOOTY
    uint256 startingPeriod; // the period this staker started staking
    uint256 endingPeriod; // the period after which this stake expires
    mapping(uint256 => uint256) spankPoints; // the spankPoints per period
  }

  mapping(address => Staker) stakers;

  function SpankBank (
    address _spankAddress,
    uint256 _periodLength,
    uint256 _maxPeriods,
    uint256 initialBootySupply
  ) {
    spankAddress = _spankAddress;
    periodLength = _periodLength * 1 days;
    spankToken = HumanStandardToken(spankAddress);
    bootyToken = new MintableToken();
    bootyToken.mint(this, initialBootySupply);
    maxPeriods = _maxPeriods;


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
  function stake(uint256 amount, uint256 periods) {
    require(periods > 0 && periods <= maxPeriods); // stake between 1-12 (max) periods
    require(amount >= 0); // stake must be greater than 0

    // the msg.sender must not have an active staking position
    require(stakers[msg.sender].stakerAddress == 0);

    // transfer SPANK to this contract - assumes sender has already "allowed" the amount
    require(spankToken.transferFrom(msg.sender, this, amount));

    // The amount of spankPoints the user will have during the next staking period
    uint256 nextSpankPoints = SafeMath.div( SafeMath.mul(amount, pointsTable[periods]), 100 );

    stakers[msg.sender] = Staker(msg.sender, amount, 0, currentPeriod+1, currentPeriod+periods);

    stakers[msg.sender].spankPoints[currentPeriod+1] = nextSpankPoints;
  }

  function getSpankPoints(address stakerAddress, uint256 period) returns (uint256) {
    return stakers[stakerAddress].spankPoints[period];
  }

  // user will be able to add more SPANK to their stake and / or extend it
  // function updateStake(uint256 amount, uint256 periods) {}

/*
  function updateBOOTYAddress(address _newBOOTYAddress) {
    // only the staker can change their BOOTY address
  }

  function withdrawStake(uint256 amount) {
    // check timelock - if expired, allow withdrawl
  }

  function sendFees(uint256 BOOTY_amount) {
    // tally usage for this period
  }

  function mint() {
    // can be called by anyone
    // checks amount of BOOTY collected in fees
    // checks total BOOTY supply
    // mints more BOOTY (if under target)
    // distributes newly minted BOOTY to staker addresses
  }*/
}
