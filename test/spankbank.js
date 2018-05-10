/* global artifacts, contract, assert, web3 */
/* eslint-env mocha */

const {increaseTimeTo, duration} = require('../utils')
const fs = require('fs')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

const data = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`))

let spankbank, spankToken, bootyToken

contract('SpankBank', accounts => {
  const owner = accounts[0]
  const p1 = accounts[1]
  const p2 = accounts[2]

  before('should deploy', async () => {
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    const bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
  })

  describe('initialization', async () => {
    it('contract deployment', async () => {
      const spankAddress = await spankbank.spankAddress()
      assert.equal(spankAddress, spankToken.address)

      const periodLength = await spankbank.periodLength()
      assert.equal(periodLength, data.spankbank.periodLength)

      const maxPeriods = await spankbank.maxPeriods()
      assert.equal(maxPeriods, data.spankbank.maxPeriods)

      const initialBootySupply = await bootyToken.totalSupply.call()
      assert.equal(initialBootySupply, data.spankbank.initialBootySupply)

      const ownerBootyBalance = await bootyToken.balanceOf.call(owner)
      assert.equal(ownerBootyBalance, data.spankbank.initialBootySupply)

      const initialCurrentPeriod = await spankbank.currentPeriod()
      assert.equal(initialCurrentPeriod, 0)

      const initialPeriodData = await spankbank.periods(0)
      const [bootyFees, totalSpankPoints, bootyMinted, mintingComplete, startTime, endTime] = initialPeriodData
      assert.equal(bootyFees, 0)
      assert.equal(totalSpankPoints, 0)
      assert.equal(bootyMinted, 0)
      assert.equal(mintingComplete, false)
      const timeSinceDeployment = new Date().getTime() / 1000 - startTime
      assert.isAtMost(timeSinceDeployment, 5) // at most 5 seconds since deployment
      assert.equal(endTime.toNumber(), startTime.add(periodLength).toNumber())
    })
  })

  describe('period 0', async () => {
    it('stake_owner', async () => {
      await spankToken.approve(spankbank.address, 100)
      await spankbank.stake(100, 12)

      const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
      assert.equal(totalSpankStaked, 100)

      const staker = await spankbank.stakers(owner)
      const [spankStaked, startingPeriod, endingPeriod] = staker
      assert.equal(spankStaked, 100)
      assert.equal(startingPeriod, 1)
      assert.equal(endingPeriod, 12)

      const spankPoints = await spankbank.getSpankPoints.call(owner, 1)
      assert.equal(spankPoints, 100)

      const didClaimBooty_0 = await spankbank.getDidClaimBooty.call(owner, 0)
      assert.equal(didClaimBooty_0, false)

      const didClaimBooty_1 = await spankbank.getDidClaimBooty.call(owner, 1)
      assert.equal(didClaimBooty_1, false)

      const [_, totalSpankPoints] = await spankbank.periods(1)
      assert.equal(totalSpankPoints, 100)
    })

    it('stake_p1', async () => {
      await spankToken.transfer(p1, 100)
      await spankToken.approve(spankbank.address, 100, { from: p1 })
      await spankbank.stake(100, 2, { from: p1 })

      const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
      assert.equal(totalSpankStaked, 200)

      const staker = await spankbank.stakers(p1)
      const [spankStaked, startingPeriod, endingPeriod] = staker
      assert.equal(spankStaked, 100)
      assert.equal(startingPeriod, 1)
      assert.equal(endingPeriod, 2)

      const spankPoints = await spankbank.getSpankPoints.call(p1, 1)
      assert.equal(spankPoints, 50)

      const didClaimBooty_0 = await spankbank.getDidClaimBooty.call(p1, 0)
      assert.equal(didClaimBooty_0, false)

      const didClaimBooty_1 = await spankbank.getDidClaimBooty.call(p1, 1)
      assert.equal(didClaimBooty_1, false)

      const [_, totalSpankPoints] = await spankbank.periods(1)
      assert.equal(totalSpankPoints, 150)
    })
  })

  describe('period 1', async () => {
    it('fast forward to period 1', async () => {
      // TODO wrap getter functions to convert bignums to integers
      const initialPeriod = await spankbank.periods(0)
      const [a, b, c, d, startTime, endTime] = initialPeriod
      await increaseTimeTo(+endTime.toNumber() + duration.days(1))
      await spankbank.updatePeriod()
      const currentPeriod = await spankbank.currentPeriod()
      assert.equal(currentPeriod, 1)
      const period_1 = await spankbank.periods(1)
      const [a1, b1, c1, d1, startTime_1, endTime_1] = period_1
      assert.equal(+endTime.toNumber(), +startTime_1.toNumber())
      assert.equal(+endTime_1.toNumber(), +startTime_1.toNumber() + duration.days(30))
    })

    it.skip('airdrop initial booty', async () => {
      // TODO not really important to do this, but we would transfer 1/3 of the
      // booty to p1
    })

    it('sendFees', async () => {
      await bootyToken.approve(spankbank.address, 1000)
      await spankbank.sendFees(1000)

      const totalBootySupply = await bootyToken.totalSupply.call()
      assert.equal(totalBootySupply, data.spankbank.initialBootySupply - 1000)

      const stakerBootyBalance = await bootyToken.balanceOf.call(owner)
      assert.equal(stakerBootyBalance, data.spankbank.initialBootySupply - 1000)

      const [bootyFees] = await spankbank.periods(1)
      assert.equal(bootyFees, 1000)
    })

    it('checkin_owner', async () => {
      await spankbank.checkIn(13)

      const staker = await spankbank.stakers(owner)
      const [,, endingPeriod] = staker
      assert.equal(endingPeriod, 13)

      const spankPoints = await spankbank.getSpankPoints.call(owner, 2)
      assert.equal(spankPoints, 100)

      const period = await spankbank.periods(2)
      const [,totalSpankPoints] = period
      assert.equal(totalSpankPoints, 100)
    })

    it('checkin_p1', async () => {
      await spankbank.checkIn(0, { from: p1 })

      const staker = await spankbank.stakers(p1)
      const [,, endingPeriod] = staker
      assert.equal(endingPeriod, 2)

      const spankPoints = await spankbank.getSpankPoints.call(p1, 2)
      assert.equal(spankPoints, 45)

      const period = await spankbank.periods(2)
      const [,totalSpankPoints] = period
      assert.equal(totalSpankPoints, 145)
    })

    it('stake_p2', async () => {
      await spankToken.transfer(p2, 100)
      await spankToken.approve(spankbank.address, 100, { from: p2 })
      await spankbank.stake(100, 6, { from: p2 })

      const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
      assert.equal(totalSpankStaked, 300)

      const staker = await spankbank.stakers(p2)
      const [spankStaked, startingPeriod, endingPeriod] = staker
      assert.equal(spankStaked, 100)
      assert.equal(startingPeriod, 2)
      assert.equal(endingPeriod, 7)

      const spankPoints = await spankbank.getSpankPoints.call(p2, 2)
      assert.equal(spankPoints, 70)

      const didClaimBooty_0 = await spankbank.getDidClaimBooty.call(p2, 0)
      assert.equal(didClaimBooty_0, false)

      const didClaimBooty_1 = await spankbank.getDidClaimBooty.call(p2, 1)
      assert.equal(didClaimBooty_1, false)

      const [_, totalSpankPoints] = await spankbank.periods(2)
      assert.equal(totalSpankPoints, 215)
    })

    it('mint_booty mints 0 booty', async () => {
      await spankbank.mintBooty()

      const [,,bootyMinted, mintingComplete] = await spankbank.periods(0)
      assert.equal(bootyMinted, 0)
      assert.equal(mintingComplete, true)

      const totalBootySupply = await bootyToken.totalSupply.call()
      assert.equal(totalBootySupply, data.spankbank.initialBootySupply - 1000)

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(spankbankBootyBalance, 0)
    })

    it('claim_booty 0 booty', async () => {
      await spankbank.claimBooty(0)

      const didClaimBooty = await spankbank.getDidClaimBooty.call(owner, 0)
      assert.equal(didClaimBooty, true)

      const bootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(bootyBalance, 0)
    })
  })

  describe('period 2', async () => {
    it('fast forward to period 2', async () => {
      // TODO wrap getter functions to convert bignums to integers
      const initialPeriod = await spankbank.periods(1)
      const [,,,, startTime_1, endTime_1] = initialPeriod
      await increaseTimeTo(+endTime_1.toNumber() + duration.days(1))
      await spankbank.updatePeriod()
      const currentPeriod = await spankbank.currentPeriod()
      assert.equal(currentPeriod, 2)
      const period = await spankbank.periods(2)
      const [,,,, startTime, endTime] = period
      assert.equal(+endTime_1.toNumber(), +startTime.toNumber())
      assert.equal(+endTime.toNumber(), +startTime.toNumber() + duration.days(30))
    })

    it('mint booty', async () => {
      await spankbank.mintBooty()

      const [,,bootyMinted, mintingComplete] = await spankbank.periods(1)
      assert.equal(bootyMinted, 11000) // 20x previous usage at 1k = 20K, prev 9K
      assert.equal(mintingComplete, true)

      const totalBootySupply = await bootyToken.totalSupply.call()
      assert.equal(totalBootySupply, 20000)

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(spankbankBootyBalance, 11000)
    })

    it('claim_booty owner', async () => {
      await spankbank.claimBooty(1)

      const didClaimBooty = await spankbank.getDidClaimBooty.call(owner, 1)
      assert.equal(didClaimBooty, true)

      // spankpoints for period 1 are:
      // owner - 100
      // p1 - 50
      // So the 11000 minted goes 7333 to owner and 3667 to p1
      // Final balance is 16333 and 3667 (bc no airdrop yet)

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(spankbankBootyBalance, 3667)

      const ownerBootyBalance = await bootyToken.balanceOf.call(owner)
      assert.equal(ownerBootyBalance, 16333)
    })

    it('claim_booty p1', async () => {
      await spankbank.claimBooty(1, { from: p1 })

      const didClaimBooty = await spankbank.getDidClaimBooty.call(p1, 1)
      assert.equal(didClaimBooty, true)

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      // there was 1 left over - TODO how to fix rounding?
      // could track withdrawals, and then give the rest to the last claimant
      // count down the number of stakers left to withdraw...
      assert.equal(spankbankBootyBalance, 1)

      const p1BootyBalance = await bootyToken.balanceOf.call(p1)
      assert.equal(p1BootyBalance, 3666) // should be 3667...
    })

    it('claim_booty p2', async () => {
      await spankbank.claimBooty(1, { from: p2 })

      const didClaimBooty = await spankbank.getDidClaimBooty.call(p2, 1)
      assert.equal(didClaimBooty, true)

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(spankbankBootyBalance, 1)

      const p2BootyBalance = await bootyToken.balanceOf.call(p2)
      assert.equal(p2BootyBalance, 0)
    })

    it('checkin_owner', async () => {
      await spankbank.checkIn(14)

      const staker = await spankbank.stakers(owner)
      const [,, endingPeriod] = staker
      assert.equal(endingPeriod, 14)

      const spankPoints = await spankbank.getSpankPoints.call(owner, 3)
      assert.equal(spankPoints, 100)

      const period = await spankbank.periods(3)
      const [,totalSpankPoints] = period
      assert.equal(totalSpankPoints, 100)
    })

    it('checkin_p2', async () => {
      await spankbank.checkIn(0, { from: p2 })

      const staker = await spankbank.stakers(p2)
      const [,, endingPeriod] = staker
      assert.equal(endingPeriod, 7)

      const spankPoints = await spankbank.getSpankPoints.call(p2, 3)
      assert.equal(spankPoints, 65)

      const period = await spankbank.periods(3)
      const [,totalSpankPoints] = period
      assert.equal(totalSpankPoints, 165)
    })

    it('sendFees', async () => {
      await bootyToken.approve(spankbank.address, 1000)
      await spankbank.sendFees(1000)

      const totalBootySupply = await bootyToken.totalSupply.call()
      assert.equal(totalBootySupply, 19000)

      const stakerBootyBalance = await bootyToken.balanceOf.call(owner)
      assert.equal(stakerBootyBalance, 15333)

      const [bootyFees] = await spankbank.periods(1)
      assert.equal(bootyFees, 1000)
    })
  })

  describe('period 3', async () => {
    it('fast forward to period 3', async () => {
      // TODO wrap getter functions to convert bignums to integers
      const initialPeriod = await spankbank.periods(2)
      const [,,,, startTime_2, endTime_2] = initialPeriod
      await increaseTimeTo(+endTime_2.toNumber() + duration.days(1))
      await spankbank.updatePeriod()
      const currentPeriod = await spankbank.currentPeriod()
      assert.equal(currentPeriod, 3)
      const period = await spankbank.periods(3)
      const [,,,, startTime, endTime] = period
      assert.equal(+endTime_2.toNumber(), +startTime.toNumber())
      assert.equal(+endTime.toNumber(), +startTime.toNumber() + duration.days(30))
    })

    it('mint booty', async () => {
      await spankbank.mintBooty()

      const [,,bootyMinted, mintingComplete] = await spankbank.periods(2)
      assert.equal(bootyMinted, 1000) // 20x previous usage at 1k = 20K, prev 9K
      assert.equal(mintingComplete, true)

      const totalBootySupply = await bootyToken.totalSupply.call()
      assert.equal(totalBootySupply, 20000)

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(spankbankBootyBalance, 1001) // 1 extra b/c rounding
    })

    it('claim_booty owner', async () => {
     await spankbank.claimBooty(2)

      const didClaimBooty = await spankbank.getDidClaimBooty.call(owner, 2)
      assert.equal(didClaimBooty, true)

      // spankpoints for period 1 are:
      // owner - 100
      // p1 - 45
      // p2 - 70
      // So the 1000 minted goes to:
      // owner - 465
      // p1 - 209
      // p2 - 326
      // Final balance are:
      // 15333 + 465 = 15798
      // p1 - 366 + 209 = 575
      // p2 - 326

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(spankbankBootyBalance, 536) // 1 extra

      const ownerBootyBalance = await bootyToken.balanceOf.call(owner)
      assert.equal(ownerBootyBalance, 15798)
    })

    it('claim_booty p1', async () => {
      await spankbank.claimBooty(2, {from: p1 })

      const didClaimBooty = await spankbank.getDidClaimBooty.call(p1, 2)
      assert.equal(didClaimBooty, true)

      // spankpoints for period 1 are:
      // owner - 100
      // p1 - 45
      // p2 - 70
      // So the 1000 minted goes to:
      // owner - 465
      // p1 - 209
      // p2 - 326
      // Final balance are:
      // 15333 + 465 = 15798
      // p1 - 3666 + 209 = 3875
      // p2 - 326

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(spankbankBootyBalance, 327) // 1 extra

      const p1BootyBalance = await bootyToken.balanceOf.call(p1)
      assert.equal(p1BootyBalance, 3875)
    })

    it('claim_booty p2', async () => {
      await spankbank.claimBooty(2, {from: p2 })

      const didClaimBooty = await spankbank.getDidClaimBooty.call(p2, 2)
      assert.equal(didClaimBooty, true)

      // spankpoints for period 1 are:
      // owner - 100
      // p1 - 45
      // p2 - 70
      // So the 1000 minted goes to:
      // owner - 465
      // p1 - 209
      // p2 - 325
      // Final balance are:
      // 15333 + 465 = 15798
      // p1 - 3666 + 209 = 3875
      // p2 - 325

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(spankbankBootyBalance, 2) // 2 extra (last time and time time)

      const p2BootyBalance = await bootyToken.balanceOf.call(p2)
      assert.equal(p2BootyBalance, 325)
    })

    it.skip('checkin owner', async () => {})
    it.skip('checkin p2', async () => {})

    it('withdraw stake p1', async () => {
      spankbank.withdrawStake({ from: p1 })

      const p1SpankBalance = await spankToken.balanceOf.call(p1)
      assert.equal(p1SpankBalance, 100)

      const spankbankSpankBalance = await spankToken.balanceOf.call(spankbank.address)
      assert.equal(spankbankSpankBalance, 200)

      const staker = await spankbank.stakers(p1)
      const [spankStaked] = staker
      assert.equal(spankStaked, 0)
    })

    // TODO test booty withdrawals on previous periods
    // TODO test failed checkins (stake expired, already checked in)
    // TODO test failed staking (stake expired, already staking)
    // TODO test recovery from skipped checkin
    // TODO test recovery from skipped booty minting
    // TODO test failed claimBooty on future periods

    // TODO test every require case and make it fail
  })
})
