const {increaseTimeTo, duration} = require('../utils')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

let spankbank, spankToken, bootyToken

const assertReverted = async (shouldFail, message = "Didn't revert") => {
  try {
    await shouldFail()
  } catch(e) {
    assert.equal(
      "VM Exception while processing transaction: revert",
      e.message,
    )
    return
  }
  assert.fail(message)
}

contract('SpankBank', ([owner, p1, p2, p3, p4, p5, ...accounts])  => {
  before('should deploy', async () => {
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    const bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
  })

  // test every require case and make it fail
  describe("Require cases", async () => {
    it("stakePeriods in range", async () => {
      await spankToken.approve(spankbank.address, 100)
      // should revert if stakePeriods is < 1 or > 12
      await assertReverted(async () => { await spankbank.stake(100, 13)})
      await assertReverted(async () => { await spankbank.stake(100, 0)})
      await spankbank.stake(100, 12)
    })

    it("Positive nonzero stakeAmount", async () => {
      await spankToken.transfer(p1, 100)
      await spankToken.approve(spankbank.address, 100, {from: p1})
      await assertReverted(async () => { await spankbank.stake(0, 12, {from: p1}) })
      await spankbank.stake(100, 12, {from: p1})
    })
  })
})
