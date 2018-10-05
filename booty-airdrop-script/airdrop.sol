pragma solidity 0.4.24;

import "./OZ_Ownable.sol";
import {MintAndBurnToken} from "./MintAndBurnToken.sol";

contract BootyDrop is Ownable {

  MintAndBurnToken public bootyToken;

  uint256 totalBootyToDrop;
  uint256 totalRecipients;

  struct Recipient {
    bool receivedBooty;
    uint256 allocation;
  }

  mapping (address => Recipient) public recipients;
  address[] public recipientsArray;
  uint256[] public allocationsArray;

  constructor(
    address bootyAddress,
    uint256 _totalBootyToDrop,
    uint256 _totalRecipients
  ) public {
    bootyToken = MintAndBurnToken(bootyAddress);
    totalBootyToDrop = _totalBootyToDrop;
    totalRecipients = _totalRecipients;
  }

  function addRecipients(
    address[] newRecipientAddresses,
    uint256[] newAllocations
  ) public onlyOwner {
    for (uint256 i; i < newRecipientAddresses.length; i++) {
      address recipientAddress = newRecipientAddresses[i];
      require(recipients[recipientAddress].allocation == 0);
      recipients[recipientAddress] = Recipient(false, newAllocations[i]);
      recipientsArray.push(recipientAddress);
      allocationsArray.push(newAllocations[i]);
    }
  }

  function airdropBooty (uint256 startIndex, uint256 stopIndex) {
    for (uint256 i=startIndex; i < stopIndex; i++) {
      recipientAddress = recipientsArray[i];
      Recipient storage recipient = recipients[recipientAddress];
      require(!recipient.receivedBooty);
      recipeint.receivedBooty = true;
      require(bootyToken.transferFrom(owner, recipientAddress, allocations[i]);
    }
  }

  function withdrawBooty() onlyOwner {
    bootyToken.transfer(owner, bootyToken.balance(this));
  }
}
