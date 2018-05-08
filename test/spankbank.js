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

  before('should deploy', async () => {
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    const bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
  })

  it('initial parameters are correct', async () => {

    const spankAddress = await spankbank.spankAddress()
    assert.equal(spankAddress, spankToken.address)

    const periodLength = await spankbank.periodLength()
    assert.equal(periodLength, data.spankbank.periodLength)

    const maxPeriods = await spankbank.maxPeriods()
    assert.equal(maxPeriods, data.spankbank.maxPeriods)

    const initialBootySupply = await bootyToken.totalSupply.call()
    assert.equal(initialBootySupply, data.spankbank.initialBootySupply)

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

  describe('period 0', async () => {
    it('stake', async () => {
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

      const didClaimBooty = await spankbank.getDidClaimBooty.call(owner, 1)
      assert.equal(didClaimBooty, false)

      const [_, totalSpankPoints] = await spankbank.periods(1)
      assert.equal(totalSpankPoints, 100)
    })
  })

  describe('period 1', async () => {
    it('fast forward to period 1', async () => {
      const initialPeriodData = await spankbank.periods(0)
      const [a, b, c, d, startTime, endTime] = initialPeriodData
      await increaseTimeTo(+endTime.toNumber() + duration.days(1))
      await spankbank.updatePeriod()
      const currentPeriod = await spankbank.currentPeriod()
      assert.equal(currentPeriod, 1)
    })
  })


  it.skip('sendFees', async () => {
    spankbank.sendBooty(owner, 1000)
  })

  // 1. Stake SPANK during period 0
  // 2. Confirm proper initial booty distribution
  // 3. Confirm staker booty withdrawal in period 1
  // 4. Stake further spank in period 1
  // 5. send fees in period 1
  // 6. mint booty during period 2
  // 7. confirm proper withdrawals for both stakers in period 2
})
