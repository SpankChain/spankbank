pragma solidity ^0.4.24;

/**
 * @title Mappings Library Data Model
 * @dev This library defines the data structures and internal functions to be used in conjunction with the MappingsLib library.
 * This library is not intended to be deployed, but only serves a compile-time dependency.
 */
library SpankLib {

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

    struct Stakes {
        mapping (bytes32 => StakeEntry) rows;
        mapping (address => bytes32[]) keysByStaker;
        bytes32[] keys;
    }

    struct StakeEntry {
        uint256 keyIndex;
        Stake stake;
        bool exists;
    }

    /**
     * @dev Adds the given Stake to the Stakes collection and registers it for the provided staker address.
     *
     * @param _stakes a Stakes collection
     * @param _stakerAddress the Staker's address
     * @param _stake the new Stake
     */
    function newStake(Stakes storage _stakes, address _stakerAddress, Stake memory _stake) internal {
        // a new key is generated based on staker address and associated number of stakes
        bytes32 newKey = keccak256(abi.encodePacked(_stakerAddress, _stakes.keysByStaker[_stakerAddress].length));
        _stakes.keysByStaker[_stakerAddress].push(newKey);
        _stakes.rows[newKey].keyIndex = (_stakes.keys.push(newKey)-1);
        _stakes.rows[newKey].stake = _stake;
        _stakes.rows[newKey].exists = true;
    }

    /**
     * @dev Removes the entry registered at the specified key in the provided map.
     * @dev the _map.keys array may get re-ordered by this operation: unless the removed entry was
     * the last element in the map's keys, the last key will be moved into the void position created
     * by the removal.
     *
     */
    // function deleteStake(Stakes storage _stakes, address _stakerAddress, bytes32 _key) internal returns (uint) {
    //     require(_stakes.rows[_key].exists, "SpankLib.deleteStake: Stake not found");
    //     bytes32 swapKey = deleteInKeys(_stakes.keys, _stakes.rows[_key].keyIndex);
    //     if (swapKey != bytes32(0)) {
    //         _stakes.rows[swapKey].keyIndex = _stakes.rows[_key].keyIndex;
    //     }
    //     // TODO delete key in _stakes.keysByStaker. Should use for loop and deleteInKeys() when entry found
    //     delete _stakes.rows[_key];
    //  }

    /**
     * @dev Deletes the element from the specified array at the given index.
     * @dev if the removed element was NOT the last entry in the array, the created void spot is filled by
     * moving the last element into the position. In that case the key of that element is returned.
     * @param _array the keys
     * @param _index the index position to delete
     * @return an empty address or the key of the element that was shuffled.
     */
    function deleteInKeys(bytes32[] storage _array, uint256 _index) internal returns (bytes32 swapKey) {
        uint lastPos = _array.length - 1;
        if (_index != lastPos) {
            swapKey = _array[lastPos];
            _array[_index] = swapKey;
        }
        _array.length--;
    }

}