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
  assert.fail("No VM Exception", "VM Exception", message)
}

contract('SpankBank', ([owner, p1, p2, p3, p4, p5, ...accounts])  => {
  before('should deploy', async () => {
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    const bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
  })

  // test every require case and make it fail
  describe("Stake requirements", async () => {
    it("stakePeriods in range", async () => {
      await spankToken.approve(spankbank.address, 100)
      // should revert if stakePeriods is < 1 or > 12
      await assertReverted(
        async () => { await spankbank.stake(100, 13)},
        "allowed 13 stakePeriods"
      )
      await assertReverted(
        async () => { await spankbank.stake(100, 0)},
        "allowed zero stakePeriods"
      )
      await spankbank.stake(100, 12)
    })

    it("stakeAmount > 0", async () => {
      await spankToken.transfer(p1, 100)
      await spankToken.approve(spankbank.address, 100, {from: p1})
      await assertReverted(
        async () => { await spankbank.stake(0, 12, {from: p1}) },
        "allowed zero stake"
      )
      await assertReverted(
        async () => { await spankbank.stake(-1, 12, {from: p1}) },
        "allowed negative stake"
      )
      await spankbank.stake(100, 12, {from: p1})
    })

    it("No active staking position", async () => {
      await spankToken.transfer(p2, 100)
      await spankToken.approve(spankbank.address, 100, {from: p2})
      // should work the first time
      await spankbank.stake(100, 1, {from: p2})
      // not the second time
      await assertReverted(
        async () => { await spankbank.stake(100, 12, {from: p2}) },
        "allowed stake with active staking position"
      )
      // TODO fast forward to a new period, then show p2 can stake again
    })

    it("Must transfer SPANK", async () => {
      // it has to be approved
      await spankToken.transfer(p3, 100)
      await assertReverted(
        async () => { await spankbank.stake(100, 12, {from: p3}) },
        "allowed stake without transfer approval"
      )
      await spankToken.approve(spankbank.address, 100, {from: p3})
      await spankbank.stake(100, 12, {from: p3})
      // they have to have enough
      await spankToken.transfer(p4, 100)
      await spankToken.approve(spankbank.address, 200, {from: p4})
      await assertReverted(
        async () => { await spankbank.stake(200, 12, {from: p4}) },
        "allowed stake of more than owned"
      )
      await spankToken.transfer(p4, 100)
      await spankbank.stake(200, 12, {from: p4})
    })
  })

  describe("sendFees requirements", async () => {
    it("bootyAmount > 0", async () => {
      await bootyToken.approve(spankbank.address, 100)
      await assertReverted(
        async () => { await spankbank.sendFees(0) },
        "allowed 0 bootyAmount"
      )
      await assertReverted(
        async () => { await spankbank.sendFees(-1) },
        "allowed -1 bootyAmount"
      )
      await spankbank.sendFees(100)
    })
  })
})
