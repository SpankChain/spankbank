/* global artifacts, contract, assert, web3 */
/* eslint-env mocha */

const {increaseTimeTo, duration} = require('../utils')
const fs = require('fs')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

const data = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`))

let spankbank, spankToken, bootyToken

// TODO we are deploying the spank token now, but wont when we do it for
// real - how to test around this? spankAddress is a constructor arg
// we need two different migrations, one for non-mainnet tests (we
// redeploy)
// when we do it for real we will use the spank token address

/*
const verify_deployment = () => {
  it('verify deployment', async () => {

  })
}*/

contract('SpankBank', accounts => {
  const owner = accounts[0]
  const p1 = accounts[1]
  const p2 = accounts[1]

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
      const [stakerAddress, spankStaked, startingPeriod, endingPeriod] = staker
      assert.equal(owner, stakerAddress)
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
      const [stakerAddress, spankStaked, startingPeriod, endingPeriod] = staker
      assert.equal(p1, stakerAddress)
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
      const [,,,endingPeriod] = staker
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
      const [,,,endingPeriod] = staker
      assert.equal(endingPeriod, 2)

      const spankPoints = await spankbank.getSpankPoints.call(p1, 2)
      assert.equal(spankPoints, 45)

      const period = await spankbank.periods(2)
      const [,totalSpankPoints] = period
      assert.equal(totalSpankPoints, 145)
    })


    it.skip('stake_p2', async () => {
      await spankToken.transfer(p2, 100)
      await spankToken.approve(spankbank.address, 100, { from: p2 })
      await spankbank.stake(100, 6, { from: p2 })

      const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
      assert.equal(totalSpankStaked, 300)

      const staker = await spankbank.stakers(p2)
      const [stakerAddress, spankStaked, startingPeriod, endingPeriod] = staker
      assert.equal(p2, stakerAddress)
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
      // TODO need the claimBooty to update total spank points
      // - and provide a way to extend the staking position
      assert.equal(totalSpankPoints, 150)
    })

    it.skip('claim initial booty', async () => {
      await spankbank.claimInitialBooty()
      const stakerBootyBalance = await bootyToken.balanceOf.call(owner)
      assert.equal(stakerBootyBalance, data.spankbank.initialBootySupply)

      const didClaimBooty = await spankbank.getDidClaimBooty.call(owner, 0)
      assert.equal(didClaimBooty, true)
    })

  })

  // Need a way to renew staking periods - but without doing claim booty (there
  // is no booty to claim (how do we do it?)
  // Those staking during period 0 can call extend during period 1 to set their
  // spankpoints for period 2
  // ... those staking during period 0 *must* call claim booty to set their
  // spank points for period 2, or will receive nothing.

  // 1. Stake SPANK during period 0
  // 2. msg.sender should receive initial booty
  // 3. fast forward to period 1
  // 4. airdrop booty on to all spank stakers, proportional to their spankpoints
  // 5. pay fees
  // 6. stake
  // 7. ff p2
  // 8. mint booty
  // 9. cliam booty
})
