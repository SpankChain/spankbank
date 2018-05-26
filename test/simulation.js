/* global artifacts, contract, assert, web3 */
/* eslint-env mocha */
const HttpProvider = require(`ethjs-provider-http`)
const EthRPC = require(`ethjs-rpc`)
const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'))

const {createStakers, getRandomInt} = require('../simulate')
const {increaseTimeTo, duration} = require('../utils')
const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

const data = require('../data.json')
const pointsTable = [0, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]

async function moveForward(duration) {
  await ethRPC.sendAsync({jsonrpc:'2.0', method: `evm_increaseTime`, params: [duration]}, (err)=> {`error increasing time`});
  return await ethRPC.sendAsync({method: `evm_mine`}, (err)=> {assert.equal(err, null, `error force mining`)});
}

async function forceMine() {
  return await ethRPC.sendAsync({method: `evm_mine`}, (err)=> {});
}

async function blockTime() {
  return await web3.eth.getBlock('latest').timestamp
}

async function stake(spankBank, spankToken, periodData, period, periodLength, allStakers) {
  const startTime = parseInt(periodData[4])
  const endTime = parseInt(periodData[5])
  
  const nextPeriod = period + 1
  const nextPeriodStartTime = startTime + (nextPeriod * periodLength)

  // console.log('allStakers', allStakers)

  allStakers.map(async (staker, index) => {
    if (staker.start >= startTime && staker.start < nextPeriodStartTime) {
      stakeTally += staker.stake
      await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
      await spankbank.stake(staker.stake, staker.periods, {from : staker.address})
      const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
      const [stakerSpankStaked, startingPeriod, endingPeriod] = await spankbank.stakers(staker.address)
    }
  })
}

contract('deploy', (accounts) => {
  const owner = accounts[0]
  let allStakers = []

  before('should deploy', async () => {
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
  })

  describe('initialization', async () => {
    it('verify parameters', async () => {
      const spankTokenAddress = await spankbank.spankToken()
      assert.equal(spankTokenAddress, spankToken.address)

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
})

contract('period 0', (accounts) => {
  const totalPeriods = 80
  const initStakers = 2
  let stakeTally = 0, period = 0, allStakers = [], startTime, periodLength
  

  before('deploy', async () => {    
    const owner = accounts[0]
    const spankBank = await SpankBank.deployed()
    const spankToken = await SpankToken.deployed()
    const bootyAddress = await spankbank.bootyToken()
    const bootyToken = await BootyToken.at(bootyAddress)
    
    const publicKeys = require('../test/publicKeys.json')
    const numBootstrapStakers = initStakers // takes first # elements of accounts and makes them stake at period 0
    const maxPeriods = parseInt(await spankbank.maxPeriods())
    const initialPeriodData = await spankbank.periods(0)
    const startTime = parseInt(initialPeriodData[4])
    const endTime = parseInt(initialPeriodData[5])
    const periodLength = parseInt(await spankbank.periodLength())

    const allStakers = createStakers(spankToken, accounts, numBootstrapStakers, publicKeys, totalPeriods, startTime, periodLength, maxPeriods)
    allStakers.map(async (staker, index) => {
      if (index!=0) {
        await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
        await spankToken.transfer(staker.address, staker.stake, {from:owner})
      }
    })
  })

  describe('stake', () => {
    it('verify staking parameters', async () => {
      let nextPeriod = period + 1
      let nextPeriodStartTime = startTime + (nextPeriod * periodLength)
      
      allStakers.map(async (staker, index) => {
        if (staker.start >= startTime && staker.start < nextPeriodStartTime) {
          stakeTally += staker.stake

          await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
          await spankbank.stake(staker.stake, staker.periods, {from : staker.address})
          
          const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
          assert.equal(stakeTally, parseInt(totalSpankStaked))

          const [stakerSpankStaked,,] = await spankbank.stakers(staker.address)
          assert.equal(staker.stake, parseInt(stakerSpankStaked))
        }
      })
    })
  })
})


contract('transition state (bootstrap -> steady)', (accounts) => {
  const totalPeriods = 80
  const initStakers = 2
  let stakeTally = 0, totalSpankPoints = 0, period = 0, periodLength = 0, endTime = 0, owner = accounts[0], totalSpankPoints_p1 = 0, cumulativeSpankPoints_p1 = 0, bootyDrop = 0, allStakers = []
  
  before('config', async () => {
    const owner = accounts[0]
    const spankBank = await SpankBank.deployed()
    const spankToken = await SpankToken.deployed()
    const bootyAddress = await spankbank.bootyToken()
    const bootyToken = await BootyToken.at(bootyAddress)
    
    const publicKeys = require('../test/publicKeys.json')
    const numBootstrapStakers = initStakers // takes first # elements of accounts and makes them stake at period 0
    const maxPeriods = parseInt(await spankbank.maxPeriods())
    const initialPeriodData = await spankbank.periods(0)
    const startTime = parseInt(initialPeriodData[4])
    const endTime = parseInt(initialPeriodData[5])
    const periodLength = parseInt(await spankbank.periodLength())

    const allStakers = createStakers(spankToken, accounts, numBootstrapStakers, publicKeys, totalPeriods, startTime, periodLength, maxPeriods)
    allStakers.map(async (staker, index) => {
      if (index!=0) {
        await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
        await spankToken.transfer(staker.address, staker.stake, {from:owner})
        await spankbank.stake(staker.stake, staker.periods, {from : staker.address})
      }
    })
  })

  describe('fast forward to period 1', function() {
    it('verify state', async () => {
      /*
      spankbank.periods :   [bootyFees, totalSpankPoints, bootyMined, mintingComplete, startTime, endTime]
      */
      const initialPeriod = await spankbank.periods(0)
      const endTime_p0 = parseInt(initialPeriod[5])
      await increaseTimeTo(endTime_p0 + duration.days(1))
      await spankbank.updatePeriod()
      
      const currentPeriod = parseInt(await spankbank.currentPeriod())
      assert.equal(currentPeriod, 1)

      const bootyFees = parseInt(initialPeriod[0])
      assert.equal(bootyFees, 0)

      const totalSpankPoints = parseInt(initialPeriod[1])
      assert.equal(totalSpankPoints, 0)

      const bootyMinted =  parseInt(initialPeriod[2])
      assert.equal(bootyMinted, 0)

      const mintingComplete =  initialPeriod[3]
      assert.equal(mintingComplete, false)

      const period_1 = await spankbank.periods(1)
      totalSpankPoints_p1 = parseInt(period_1[1])
      const startTime_p1 = parseInt(period_1[4])
      const endTime_p1 = parseInt(period_1[5])
      assert.equal(endTime_p0, startTime_p1)
      assert.equal(endTime_p1, startTime_p1 + duration.days(30))

      allStakers.map(async (staker, index) => {
        if (startTime <= staker.start && staker.start < endTime) {
          const spankPoints = parseInt(await spankbank.getSpankPoints.call(staker.address, 1))
          const calculatedPoints = Math.floor((parseInt(staker.stake) * parseInt(pointsTable[staker.periods])) / 100)
          assert.equal(spankPoints, calculatedPoints)
          cumulativeSpankPoints_p1 += spankPoints

          // console.log(index, "calculatedPoints", calculatedPoints)
          // console.log(index, "spankPoints", spankPoints)
          // console.log(index, "staker.stake", staker.stake)
          // console.log(index, "pointsTable[staker.periods]", pointsTable[staker.periods])
          // console.log(index, "staker.periods", staker.periods)
          // console.log('totalPeriodOneSpankPoints', totalPeriodOneSpankPoints)
          // console.log()
        }
      })      
    })
    it ('verify booty points', async () => {
      assert.equal(totalSpankPoints_p1, cumulativeSpankPoints_p1)
      
      // calculate airdrop
      allStakers.map(async (staker, index) => {
        if (startTime <= staker.start && staker.start < endTime) {
          const calculatedPoints = Math.floor(staker.stake * pointsTable[staker.periods] / 100)
          const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)          
          bootyDrop = Math.floor((staker.stake / totalSpankStaked) * totalSpankPoints_p1)
          await bootyToken.transfer(staker.address, bootyDrop, {from:owner})
          // console.log('bootyDrop', bootyDrop)
        }
      })
    })
    it('verify airdropped booty', async () => {
      bootyRemaining = parseInt(await bootyToken.balanceOf.call(owner))
      assert.equal(data.spankbank.initialBootySupply, bootyRemaining + bootyDrop)
      // console.log('bootyDrop', bootyDrop)
      // console.log('bootyRemaining', bootyRemaining)
      // console.log('data.spankbank.initialBootySupply', data.spankbank.initialBootySupply)
    })
  })
})
