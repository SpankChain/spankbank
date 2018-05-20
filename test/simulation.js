/* global artifacts, contract, assert, web3 */
/* eslint-env mocha */

const {increaseTimeTo, duration, latestTime} = require('../utils')
const {calculate, createStakers, getRandomInt, canStartStaking} = require('../simulate')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

const data = require('../data.json')
const publicKeys = require('../test/publicKeys.json')

const totalSimPeriods = getRandomInt(2, 5)
console.log('totalSimPeriods', totalSimPeriods)

contract('SpankBank', function(accounts) {
  before('deploy', async function() {
    owner = accounts[0]
    stakeTally = 0 
    period = 0
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    const bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    periodLength = parseInt(await spankbank.periodLength())
    maxPeriods = await spankbank.maxPeriods()
    const initialPeriodData = await spankbank.periods(0)
    startTime = +initialPeriodData[4]
    const numBootstrapStakers = 2
    allStakers = createStakers(spankToken, accounts, numBootstrapStakers, publicKeys, totalSimPeriods, startTime, periodLength, maxPeriods)
  })
  describe('initialization', function() {
    it('contract deployment', async function() {
      const periodLength = await spankbank.periodLength()

      assert.equal(periodLength.toNumber(), data.spankbank.periodLength)

      const maxPeriods = await spankbank.maxPeriods()
      assert.equal(+maxPeriods, data.spankbank.maxPeriods)

      const initialBootySupply = await bootyToken.totalSupply.call()
      assert.equal(+initialBootySupply, data.spankbank.initialBootySupply)

      const ownerBootyBalance = await bootyToken.balanceOf.call(owner)
      assert.equal(+ownerBootyBalance, data.spankbank.initialBootySupply)

      const initialCurrentPeriod = await spankbank.currentPeriod()
      assert.equal(+initialCurrentPeriod, 0)

      const initialPeriodData = await spankbank.periods(0)
      const [bootyFees, totalSpankPoints, bootyMinted, mintingComplete, startTime, endTime] = initialPeriodData
      assert.equal(+bootyFees, 0)
      assert.equal(+totalSpankPoints, 0)
      assert.equal(+bootyMinted, 0)
      assert.equal(+mintingComplete, false)
      const timeSinceDeployment = new Date().getTime() / 1000 - startTime
      assert.isAtMost(+timeSinceDeployment, 5) // at most 5 seconds since deployment
      assert.equal(+endTime, +startTime.add(periodLength))
    })
  })

  describe('period 0', function() {
    it('stake', async function() {      
      allStakers.map(async (staker, index) => {
        let nextPeriod = period + 1
        let nextPeriodStartTime = startTime + (nextPeriod * periodLength)
        let isStaking = canStartStaking(staker, startTime, nextPeriodStartTime)
        if (isStaking) {
            await spankToken.transfer(staker.address, staker.stake)
            await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
  
            let amountToStake = getRandomInt(0, staker.stake)
            await spankbank.stake(amountToStake, staker.periods, {from : staker.address})    
            let totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
            stakeTally += amountToStake
            
            const [stakerSpankStaked,,] = await spankbank.stakers(staker.address)
        }
      })
    })
  })

  describe(`periods`, function() {
    it(`looping`, async () => {
      for (let loopPeriod=1; loopPeriod < totalSimPeriods; loopPeriod++) {
        const blockTime = await latestTime()
        await increaseTimeTo(blockTime + periodLength)
        await spankbank.updatePeriod()

        const lastPeriod = await spankbank.periods(loopPeriod-1)
        const [,,,, lastPeriodStartTime, lastPeriodEndTime] = lastPeriod
        const thisPeriod = await spankbank.periods(loopPeriod)
        const [,,,, thisPeriodStartTime, thisPeriodEndTime] = thisPeriod
        const nextPeriodStartTime = periodLength + thisPeriodStartTime.toNumber()
        const currentPeriod = await spankbank.currentPeriod()

        allStakers.map(async (staker, index) => {
          let isStaking = canStartStaking(staker, thisPeriodStartTime.toNumber(), nextPeriodStartTime)
          if (isStaking) {
            await spankToken.transfer(staker.address, staker.stake, {from: owner})
            await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})

            let amountToStake = getRandomInt(0, staker.stake)
            await spankbank.stake(amountToStake, staker.periods, {from : staker.address})    
            let totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
            stakeTally += amountToStake
            
            const [stakerSpankStaked,,] = await spankbank.stakers(staker.address)
            assert.equal(amountToStake, stakerSpankStaked.toNumber())
            assert.equal(stakeTally, totalSpankStaked.toNumber())
          }
        })
      }
    })
  })
})
