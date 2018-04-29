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

  // ERC-20 BASED TOKEN WITH SOME ADDED PROPERTIES FOR HUMAN READABILITY
  // https://github.com/ConsenSys/Tokens/blob/master/contracts/HumanStandardToken.sol
  HumanStandardToken public spankToken;
  MintableToken public bootyToken;

  /*************************************
  INTERAL ACCOUNTING
  **************************************/
  uint256 public period = 0;



  /*
  struct Staker {
    address addr;
    address bootybase;
    uint256 SPANK_balance;
    uint256 BOOTY_balance;
    uint256 starting_period;
    uint256 ending_period;
    // BOOTY distribution address
    // want a way for Stakers to change their BOOTY distirbution address as desired
  }*/

  function SpankBank (
    address _spankAddress,
    uint256 _periodLength
  ) {
    spankAddress = _spankAddress;
    periodLength = _periodLength * 1 days;
    spankToken = HumanStandardToken(spankAddress);
    bootyToken = new MintableToken();
  }

  /*
  function stake(uint256 amount, uint256 time) {
    // transfer SPANK from msg.sender to this
    // update SPANK balance for msg.sender
    // - how to make this work for multi-sig wallets as well?
    // - can't use msg.sender?
    // probably want to move away from 30% upfront BOOTY reward
    // - how to calculate it for the later months? This makes no sense

    // decide on the ratio of additional BOOTY to reward for long term stakers
    // - base level: 100% for staking for 1 year, 70% for staking for 1 month
  }*/

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
