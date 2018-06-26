pragma solidity 0.4.24;
import {SafeMath} from "./SafeMath.sol";
import {HumanStandardToken} from "./HumanStandardToken.sol";
import {MintableToken} from "./MintableToken.sol";

contract SpankBank {

    event StakeEvent(
        address indexed staker,
        uint indexed startPeriod,
        uint indexed endPeriod,
        address activityKey,
        address bootyBase
    );
    
    event SendFeesEvent (
        address indexed sender,
        uint indexed bootyAmount,
        uint indexed currentBootyFees
    );

    event MintBootyEvent (
        uint indexed targetBootySupply,
        uint indexed totalBootySupply,
        uint indexed currentPeriod
    );

    event CheckInEvent (
        address indexed staker,
        uint indexed updatedEndingPeriod,
        uint indexed currentPeriod
    );

    event ClaimBootyEvent (
        address indexed staker,
        uint indexed period,
        uint indexed bootyOwed,
        uint stakerSpankPoints
    );

    event WithdrawStakeEvent (
        address indexed staker,
        uint indexed totalSpankStaked,
        uint indexed currentPeriod
        
    );

    event SplitStakeEvent (
        address indexed staker,
        address indexed newAddress,
        uint indexed spankAmount,
        uint currentPeriod,
        uint startingPeriod,
        uint endingPeriod,
        address activityKey,
        address bootyBase
    );

    event VoteToUnwindEvent (
        address indexed staker,
        uint indexed spankStaked,
        bool indexed unwind,
        uint currentPeriod,
        uint totalSpankStaked
    );

    event UpdateActivityKeyEvent (
        address indexed staker,
        address indexed newActivityKey,
        uint indexed currentPeriod
    );

    event UpdateBootyBaseEvent (
        address indexed staker,
        address indexed newBootyBase,
        uint indexed currentPeriod
    );

    /***********************************
    VARIABLES SET AT CONTRACT DEPLOYMENT
    ************************************/
    // GLOBAL CONSTANT VARIABLES
    uint256 public periodLength; // time length of each period in seconds
    uint256 public maxPeriods;
    uint256 public totalSpankStaked;
    uint256 public unwindVotes;
    uint256 public unwindPeriod;
    bool public unwind;

    // ERC-20 BASED TOKEN WITH SOME ADDED PROPERTIES FOR HUMAN READABILITY
    // https://github.com/ConsenSys/Tokens/blob/master/contracts/HumanStandardToken.sol
    HumanStandardToken public spankToken;
    MintableToken public bootyToken;

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
        mapping(uint256 => bool) votedToUnwind; // true if voter voted 
        address activityKey;
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
    }

    mapping(uint256 => Period) public periods;

    struct ActivityKey {
        address stakerAddress;
    }

    mapping(address => ActivityKey) public activityKeys;

    modifier active() {
      require(unwind == false);
      _;
    }

    constructor (
        uint256 _periodLength,
        uint256 _maxPeriods,
        address spankAddress,
        uint256 initialBootySupply
    )   public {
        periodLength = _periodLength;
        maxPeriods = _maxPeriods;
        spankToken = HumanStandardToken(spankAddress);
        bootyToken = new MintableToken();
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
    }

    // Used to create a new staking position - verifies that the caller is not staking
    function stake(uint256 spankAmount, uint256 stakePeriods, address activityKey, address bootyBase) active public {
        updatePeriod();

        require(stakePeriods > 0 && stakePeriods <= maxPeriods, "stake:: stake must be between 0 and maxPeriods"); // stake 1-12 (max) periods
        require(spankAmount > 0, "stake::spankAmount must be greater than 0"); // stake must be greater than 0

        // the msg.sender must not have an active staking position
        // TODO checking that endingPeriod == 0 should cover all periods
        require(stakers[msg.sender].startingPeriod == 0 && stakers[msg.sender].endingPeriod == 0, "stake::startingPeriod and endingPeriod must be 0");

        // transfer SPANK to this contract - assumes sender has already "allowed" the spankAmount
        require(spankToken.transferFrom(msg.sender, this, spankAmount),"stake::spankToken transfer failure");

        // The spankAmount of spankPoints the user will have during the next staking period
        // TODO the division is unnecessary - we're only dividing by the total
        uint256 nextSpankPoints = SafeMath.div( SafeMath.mul(spankAmount, pointsTable[stakePeriods]), 100 );

        stakers[msg.sender] = Staker(spankAmount, currentPeriod + 1, currentPeriod + stakePeriods, activityKey, bootyBase);

        stakers[msg.sender].spankPoints[currentPeriod + 1] = nextSpankPoints;

        uint256 nextTotalSpankPoints = periods[currentPeriod + 1].totalSpankPoints;
        nextTotalSpankPoints = SafeMath.add(nextTotalSpankPoints, nextSpankPoints);
        periods[currentPeriod + 1].totalSpankPoints = nextTotalSpankPoints;

        totalSpankStaked = SafeMath.add(totalSpankStaked, spankAmount);

        ActivityKey storage newActivityKey = activityKeys[activityKey];
        require(newActivityKey.stakerAddress == address(0));
        newActivityKey.stakerAddress = msg.sender;

        emit StakeEvent(msg.sender, currentPeriod + 1, currentPeriod + stakePeriods, activityKey, bootyBase);
    }

    function getSpankPoints(address stakerAddress, uint256 period) public view returns (uint256)  {
        return stakers[stakerAddress].spankPoints[period];
    }

    function getDidClaimBooty(address stakerAddress, uint256 period) public view returns (bool)  {
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

    function sendFees(uint256 bootyAmount) active public {
        updatePeriod();

        require(bootyAmount > 0, "sendFees::fees must be greater than 0"); // fees must be greater than 0
        require(bootyToken.transferFrom(msg.sender, this, bootyAmount), "sendFees::bootyToken transfer failed");

        bootyToken.burn(bootyAmount);

        uint256 currentBootyFees = periods[currentPeriod].bootyFees;
        currentBootyFees = SafeMath.add(bootyAmount, currentBootyFees);
        periods[currentPeriod].bootyFees = currentBootyFees;

        emit SendFeesEvent(msg.sender, bootyAmount, currentBootyFees);
    }

    function mintBooty() active public {
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
        }
    }

    // This will check the current time and update the current period accordingly
    // - called from all write functions to ensure the period is always up to date before any writes
    // - can also be called externally, but there isn't a good reason for why you would want to
    // - the while loop protects against the edge case where we miss a period

    function updatePeriod() public {
        while (now >= periods[currentPeriod].endTime) {
            Period memory prevPeriod = periods[currentPeriod];
            currentPeriod += 1;
            periods[currentPeriod].startTime = prevPeriod.endTime;
            periods[currentPeriod].endTime = SafeMath.add(prevPeriod.endTime, periodLength);
        }
    }

    // In order to receive Booty, each staker will have to check-in every period.
    // This check-in will compute the spankPoints locally and globally for each staker.
    function checkIn(uint256 updatedEndingPeriod) active public {
        updatePeriod();

        address stakerAddress =  activityKeys[msg.sender].stakerAddress;

        Staker storage staker = stakers[stakerAddress];

        require(currentPeriod < staker.endingPeriod);

        if (updatedEndingPeriod > 0) {
            // TODO I'm not sure we can rely on the staker.endingPeriod to be greater than the
            // currentPeriod - what if the staker expires but never withdraws their stake?
            require(updatedEndingPeriod > currentPeriod, "checkIn::updatedEndingPeriod must be greater than currentPeriod");
            require(updatedEndingPeriod > staker.endingPeriod, "checkIn::updatedEndingPeriod must be greater than staker.endingPeriod");
            require(updatedEndingPeriod <= currentPeriod + maxPeriods, "updatedEndingPeriod must be less than or equal to currentPeriod + maxPeriods");

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

        emit CheckInEvent(stakerAddress, updatedEndingPeriod, currentPeriod);
    }

    function claimBooty(uint256 _period) public {
        updatePeriod();

        require(_period < currentPeriod, "claimBooty::_period must be less than currentPeriod"); // can only claim booty for previous periods

        address stakerAddress =  activityKeys[msg.sender].stakerAddress;

        Staker storage staker = stakers[stakerAddress];

        require(!staker.didClaimBooty[_period], "claimBooty::didClaimBooty for period must be false"); // can only claim booty once

        staker.didClaimBooty[_period] = true;

        Period memory period = periods[_period];
        uint256 bootyMinted = period.bootyMinted;
        uint256 totalSpankPoints = period.totalSpankPoints;

        require(period.mintingComplete);

        if (totalSpankPoints > 0) {
            uint256 stakerSpankPoints = staker.spankPoints[_period];
            uint256 bootyOwed = SafeMath.div(SafeMath.mul(stakerSpankPoints, bootyMinted), totalSpankPoints);

          require(bootyToken.transfer(staker.bootyBase, bootyOwed), "claimBooty::bootyToken transfer failure");

          emit ClaimBootyEvent(stakerAddress, _period, bootyOwed, stakerSpankPoints);
        }
    }

    function withdrawStake() public {
        updatePeriod();

        address stakerAddress =  activityKeys[msg.sender].stakerAddress;

        Staker storage staker = stakers[stakerAddress];

        require(currentPeriod > staker.endingPeriod, "withdrawStake::currentPeriod must be greater than staker.endingPeriod");

        spankToken.transfer(stakerAddress, staker.spankStaked);

        totalSpankStaked = SafeMath.sub(totalSpankStaked, staker.spankStaked);
        staker.spankStaked = 0;

        emit WithdrawStakeEvent(stakerAddress, totalSpankStaked, currentPeriod);
    }

    function splitStake(address newAddress, address newActivityKey, address newBootyBase, uint256 spankAmount) public {
        updatePeriod();

        require(newAddress != address(0), "splitStake::newAddress must be a non-zero address");
        require(spankAmount > 0, "splitStake::spankAmount must be greater than 0");

        Staker storage staker = stakers[msg.sender];
        require(currentPeriod < staker.endingPeriod, "currentPeriod must be less than staker.endingPeriod");
        require(spankAmount <= staker.spankStaked, "spankAmount must be less than or equal to staker.spankStaked");
        staker.spankStaked = SafeMath.sub(staker.spankStaked, spankAmount);

        stakers[newAddress] = Staker(spankAmount, staker.startingPeriod, staker.endingPeriod, newActivityKey, newBootyBase);

        ActivityKey storage splitActivityKey = activityKeys[newActivityKey];
        splitActivityKey.stakerAddress = newAddress;

        emit SplitStakeEvent(msg.sender, newAddress, spankAmount, currentPeriod, staker.startingPeriod, staker.endingPeriod, newActivityKey, newBootyBase);
    }

    function voteToUnwind() public {
        updatePeriod();

        require(unwind == false);

        address stakerAddress = activityKeys[msg.sender].stakerAddress;
        require(stakerAddress != address(0));

        Staker storage staker = stakers[stakerAddress];
        require(staker.spankStaked > 0);
        require(staker.endingPeriod >= currentPeriod);
        

        if (unwindPeriod != currentPeriod) {
            unwindPeriod = currentPeriod;
            unwindVotes = 0;
            staker.votedToUnwind[currentPeriod] = false;
        }
        
        require (staker.votedToUnwind[currentPeriod] == false);
        staker.votedToUnwind[currentPeriod] = true;
        unwindVotes = SafeMath.add(unwindVotes, staker.spankStaked);

        uint256 unwindTrigger = SafeMath.div(totalSpankStaked, 2);
        if (unwindVotes > unwindTrigger) {
            unwind = true;
        }

        emit VoteToUnwindEvent(stakerAddress, staker.spankStaked, unwind, currentPeriod, totalSpankStaked);
    }

    function updateActivityKey(address newActivityKey) public {
        Staker storage staker = stakers[msg.sender];
        require (staker.activityKey != address(0));
        staker.activityKey = newActivityKey;
        
        ActivityKey storage oldActivityKey = activityKeys[staker.activityKey];
        oldActivityKey.stakerAddress = address(0);

        ActivityKey storage activityKey = activityKeys[newActivityKey];
        activityKey.stakerAddress = msg.sender;

        emit UpdateActivityKeyEvent(msg.sender, newActivityKey, currentPeriod);
    }

    function updateBootyBase(address newBootyBase) public {
        Staker storage staker = stakers[msg.sender];
        require (staker.spankStaked > 0);

        staker.bootyBase = newBootyBase;

        emit UpdateBootyBaseEvent(msg.sender, newBootyBase, currentPeriod);
    }

    // TODO as-is, the contract doesnt allow for dynamic stake allocation - you can only extend
    // the entire stake, or withdraw the entire stake. Even if you could withdraw partial stake,
    // you would still be making the decision to extend the entire stake, or not.
    // - allow staker to split stake (or move some fraction under a new address)
    // - accept that you have to extend the entire stake, and plan ahead accordingly
    //   - split the stake up into several portions, and decide to extend / not each portion
}
