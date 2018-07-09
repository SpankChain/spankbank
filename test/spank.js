// const {injectInTruffle} = require(`sol-trace`)
// injectInTruffle(web3, artifacts);

const HttpProvider = require(`ethjs-provider-http`)
const EthRPC = require(`ethjs-rpc`)
const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'))

const BigNumber = web3.BigNumber
const should = require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should()
const SolRevert = 'VM Exception while processing transaction: revert'

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintAndBurnToken')
const SpankBank = artifacts.require('./SpankBank')

const data = require('../data.json')
const pointsTable = [0, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]

/* convenience functions */
async function forceMine() {
  return await ethRPC.sendAsync({method: `evm_mine`}, (err)=> {});
}

async function blockTime() {
  return await web3.eth.getBlock('latest').timestamp
}

async function moveForwardPeriods(periods) {
  const goToTime = data.spankbank.periodLength * periods
  await ethRPC.sendAsync({jsonrpc:'2.0', method: `evm_increaseTime`, params: [goToTime]}, (err)=> {`error increasing time`});
  return await ethRPC.sendAsync({method: `evm_mine`}, (err)=> {assert.equal(err, null, `error force mining`)});
}

async function getStaker(address) {
  resp = await spankbank.stakers(address)
  return {address : address, stake : resp[0], startingPeriod : resp[1], endingPeriod : resp[2], delegateKey : resp[3], bootyBase: resp[4] }
}

async function didStake(address, currentPeriod) {
  confirmStaker = await getStaker(address)
  confirmStaker.address.should.be.equal(address)
  confirmStaker.stake.should.be.bignumber.above(0)
  startPeriod = currentPeriod.plus(1)
  confirmStaker.startingPeriod.should.be.bignumber.equal(startPeriod)
  confirmStaker.endingPeriod.should.be.bignumber.above(startPeriod)
  return true
}

function validateSplitStakeEvent(currentPeriod, amount, staker, splitStaker, ev) {
  ev.staker.should.be.equal(staker.address)
  ev.newAddress.should.be.equal(splitStaker.address)
  ev.spankAmount.should.be.bignumber.equal(amount)
  ev.currentPeriod.should.be.bignumber.equal(parseInt(currentPeriod))
  ev.startingPeriod.should.be.bignumber.equal(staker.startingPeriod)
  ev.endingPeriod.should.be.bignumber.equal(staker.endingPeriod)
  return true
}

async function getEventParams(tx, event) {
  if (tx.logs.length > 0) {
    for (let idx=0; idx < tx.logs.length; idx++) {
      if (tx.logs[idx].event == event) {
        return tx.logs[idx].args
      }
    }
  }
  return false  
}

async function getPeriod(period) {
  resp = await spankbank.getPeriod(period)
  return { period : period, bootyFees : resp[0], totalSpankPoints : resp[1], bootyMinted : resp[2], mintingComplete : resp[3], startTime: resp[4], endTime: resp[5] }
}

/*
  Tests are segmented by contract methods. The SpankBank methods tested are :
  1. stakeFromPrivateKey
  2. sendFees
  3. mintBooty
  4. checkIn
  5. claimBooty
  6. withdrawStake
  7. splitStake
  8. voteToClose
  9. updateDelegateKey
  10. updateBootyBase

  Each method is tested to verify specific failure scenarios which requires testing to ensure all other scenerios pass verifying that the specific failure scenario works as intended.
*/

contract('SpankBank::stakeFromPrivateKey()', (accounts) => {
  before('deploy', async () => {    
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    staker = {
      address : accounts[0],
      stake : 100,
      delegateKey : accounts[0],
      bootyBase : accounts[0]
    }
    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
    
    newStaker = {
      address : accounts[9],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(newStaker.address, newStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, newStaker.stake, {from: newStaker.address})
  })

  describe('Staking has nine requirements (counting logical AND requirements individually when possible).\n\t1. stake period greater than zero \n\t2. stake period less than or equal to maxPeriods \n\t3. stake greater than zero \n\t4. startingPeriod is zero \n\t5. endingPeriod is zero \n\t6. transfer complete \n\t7. delegateKey is not 0x0 \n\t8. bootyBase is not 0x0 \n\t9. delegateKey -> stakerAddress is 0x0', () => {
    /*
    1. stake period greater than zero
    2. stake period less than or equal to maxPeriods
    3. stake greater than zero
    4. startingPeriod is zero
    5. endingPeriod is zero
    6. transfer complete
    7. delegateKey is not 0x0
    8. bootyBase is not 0x0
    9. delegateKey -> stakerAddress is 0x0
    */
    
    it('1. stake periods is zero', async () => {     
      staker.periods = 0
      bankedStaker = await getStaker(staker.address)
      stakerBalance = await spankToken.balanceOf(staker.address)
      bankedDelegateKey = await spankbank.getStakerFromDelegateKey(staker.address)
      expect(staker.periods).to.be.equal(0) // 1. fail
      expect(staker.periods).to.be.below(maxPeriods) // 2. pass
      expect(staker.stake).to.be.above(0) // 3. pass
      bankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      bankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      stakerBalance.should.not.be.bignumber.below(staker.stake) // 6. pass
      expect(staker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(staker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(bankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('2. stake periods is greater than maxPeriods', async () => {
      staker.periods = 13
      bankedStaker = await getStaker(staker.address)
      stakerBalance = await spankToken.balanceOf(staker.address)
      bankedDelegateKey = await spankbank.getStakerFromDelegateKey(staker.address)
      expect(staker.periods).to.be.above(0) // 1. pass
      expect(staker.periods).to.be.above(maxPeriods) // 2. fail
      expect(staker.stake).to.be.above(0) // 3. pass
      bankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      bankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      stakerBalance.should.not.be.bignumber.below(staker.stake) // 6. pass
      expect(staker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(staker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(bankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('3. stake amount is zero', async () => {
      staker.periods = 12
      staker.stake = 0

      bankedStaker = await getStaker(staker.address)
      stakerBalance = await spankToken.balanceOf(staker.address)
      bankedDelegateKey = await spankbank.getStakerFromDelegateKey(staker.address)
      expect(staker.periods).to.be.above(0) // 1. pass
      expect(staker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(staker.stake).to.be.equal(0) // 3. fail
      bankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      bankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      stakerBalance.should.not.be.bignumber.below(staker.stake) // 6. pass
      expect(staker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(staker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(bankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass
      
      await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('4/5/(9). startingPeriod and EndingPeriod not zero (staker delegateKey exists)', async () => {
      staker.stake = 1
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})  
      
      bankedStaker = await getStaker(staker.address)
      stakerBalance = await spankToken.balanceOf(staker.address)
      bankedDelegateKey = await spankbank.getStakerFromDelegateKey(staker.address)
      expect(staker.periods).to.be.above(0) // 1. pass
      expect(staker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(staker.stake).to.be.above(0) // 3. pass
      bankedStaker.startingPeriod.should.not.be.bignumber.equal(0) // 4. fail
      bankedStaker.endingPeriod.should.not.be.bignumber.equal(0) // 5. fail
      stakerBalance.should.not.be.bignumber.below(staker.stake) // 6. pass
      expect(staker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(staker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(bankedDelegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('6. transfer failure', async () => {
      bankedStaker = await getStaker(newStaker.address)
      stakerBalance = await spankToken.balanceOf(newStaker.address)
      bankedDelegateKey = await spankbank.getStakerFromDelegateKey(newStaker.address)
      newStaker.delegateKey = staker.address
      newStaker.bootyBase = staker.address
      expect(newStaker.periods).to.be.above(0) // 1. pass
      expect(newStaker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(newStaker.stake).to.be.above(0) // 3. pass
      bankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      bankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      stakerBalance.should.not.be.bignumber.below(newStaker.stake) // 6. fail
      expect(newStaker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(newStaker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(bankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      await spankbank.stakeFromPrivateKey(newStaker.stake, newStaker.periods, newStaker.delegateKey, newStaker.address, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('7. staker delegate key is 0x0', async () => {
      bankedStaker = await getStaker(newStaker.address)
      stakerBalance = await spankToken.balanceOf(newStaker.address)
      bankedDelegateKey = await spankbank.getStakerFromDelegateKey(newStaker.address)
      newStaker.delegateKey = "0x0000000000000000000000000000000000000000"
      newStaker.bootyBase = staker.address
      expect(newStaker.periods).to.be.above(0) // 1. pass
      expect(newStaker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(newStaker.stake).to.be.above(0) // 3. pass
      bankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      bankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      stakerBalance.should.not.be.bignumber.below(newStaker.stake) // 6. pass
      expect(newStaker.delegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 7. fail
      expect(newStaker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(bankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      await spankbank.stakeFromPrivateKey(newStaker.stake, newStaker.periods, newStaker.delegateKey, newStaker.address, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('8. staker bootyBase is 0x0', async () => {
      bankedStaker = await getStaker(newStaker.address)
      stakerBalance = await spankToken.balanceOf(newStaker.address)
      bankedDelegateKey = await spankbank.getStakerFromDelegateKey(newStaker.address)
      newStaker.delegateKey = staker.address
      newStaker.bootyBase = "0x0000000000000000000000000000000000000000"
      expect(newStaker.periods).to.be.above(0) // 1. pass
      expect(newStaker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(newStaker.stake).to.be.above(0) // 3. pass
      bankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      bankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      stakerBalance.should.not.be.bignumber.below(newStaker.stake) // 6. pass
      expect(newStaker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(newStaker.bootyBase).to.be.equal("0x0000000000000000000000000000000000000000") // 8. fail
      expect(bankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      await spankbank.stakeFromPrivateKey(newStaker.stake, newStaker.periods, newStaker.address, newStaker.bootyBase, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
    })
    it('9. delegateKey has already been used', async () => {
      bankedStaker = await getStaker(newStaker.address)
      stakerBalance = await spankToken.balanceOf(newStaker.address)
      bankedDelegateKey = await spankbank.getStakerFromDelegateKey(newStaker.address)
      newStaker.bootyBase = staker.address
      expect(newStaker.periods).to.be.above(0) // 1. pass
      expect(newStaker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(newStaker.stake).to.be.above(0) // 3. pass
      bankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      bankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      stakerBalance.should.not.be.bignumber.below(newStaker.stake) // 6. pass
      expect(newStaker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(newStaker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. fail
      expect(newStaker.delegateKey).to.be.equal(staker.address) // 9. fail

      await spankbank.stakeFromPrivateKey(newStaker.stake, newStaker.periods, newStaker.delegateKey, newStaker.bootyBase, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('SUCCESS!', async () => {
      bankedStaker = await getStaker(newStaker.address)
      stakerBalance = await spankToken.balanceOf(newStaker.address)
      newStaker.delegateKey = newStaker.address
      newStaker.bootyBase = newStaker.address
      expect(newStaker.periods).to.be.above(0) // 1. pass
      expect(newStaker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(newStaker.stake).to.be.above(0) // 3. pass
      bankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      bankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      stakerBalance.should.not.be.bignumber.below(newStaker.stake) // 6. pass
      expect(newStaker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(newStaker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. fail
      expect(bankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      await spankbank.stakeFromPrivateKey(newStaker.stake, newStaker.periods, newStaker.delegateKey, newStaker.bootyBase, {from : newStaker.address})
    })

  })
})

contract('SpankBank::sendFees()', (accounts) => {
  before('deploy', async () => {    
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    staker = {
      address : accounts[0],
      stake : 100,
      periods : 12
    }
    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
    await bootyToken.approve(spankbank.address, data.spankbank.initialBootySupply, {from: staker.address})
  })

  describe('sending fees has two requirements\n\t1. BOOTY amount must be greater than zero\n\t2. transfer complete', () => {
    it('1. sending zero amount', async () => {     
      await spankbank.sendFees(0,{frome: staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('2. transfer failure - sending more than exists', async () => {     
      await spankbank.sendFees(data.spankbank.initialBootySupply+1,{from: staker.address}).should.be.rejectedWith(SolRevert)
    })
    it('SUCCESS!', async () => {     
      await spankbank.sendFees(1, {from: staker.address})
    })
  })
})

contract('SpankBank::mintBooty()', (accounts) => {
  before('deploy', async () => {    
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())
  })

  describe('minting BOOTY has one requirement\n\t1. mintingComplete is  false for the period', () => {
    it('1. minting already complete', async () => {     
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      await spankbank.mintBooty()
      currentPeriod = await spankbank.currentPeriod()
      perviousPeriodInfo = await getPeriod( parseInt(currentPeriod) -1 )
      
      expect(perviousPeriodInfo.mintingComplete).to.be.true
      await spankbank.mintBooty().should.be.rejectedWith(SolRevert)
    })
    it('SUCCESS!', async () => {
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      await spankbank.mintBooty()
    })
  })
})

contract('SpankBank::checkIn()', (accounts) => {
  before('deploy', async () => {    
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    expiredStaker = {
      address : accounts[0],
      stake : 100,
      periods : 12
    }

    await spankToken.approve(spankbank.address, expiredStaker.stake, {from: expiredStaker.address})
    await spankbank.stakeFromPrivateKey(expiredStaker.stake, expiredStaker.periods, expiredStaker.address, expiredStaker.address, {from : expiredStaker.address})
  })

  describe('checking in has three requirements\n\t1. updated ending period is greater than the current period\n\t2. updated ending period is greater than the staker ending period\n\t3. the updated ending period is less than or equal to the max number of allowed periods starting from the current period', () => {

    /*
    test require failure for updatedEndingPeriod > currentPeriod and verify passing of requires :
    - updatedEndingPeriod > staker.endingPeriod
    - updatedEndingPeriod <= currentPeriod + maxPeriods
    ------------------------------
      |          |         |  
    checkin   current   staker end
    */
    it('1. current period not greater than updated ending period', async () => {  
      await moveForwardPeriods(3)
      await spankbank.updatePeriod()
      currentPeriod = await spankbank.currentPeriod()
      faultyCheckInPeriod = parseInt(currentPeriod) - 1
      expiredBankedStaker = await getStaker(expiredStaker.address)
      
      expiredBankedStaker.endingPeriod.should.be.bignumber.above( currentPeriod )
      expect(faultyCheckInPeriod).to.be.below(parseInt(currentPeriod) + maxPeriods)
      await spankbank.checkIn(faultyCheckInPeriod, {from: expiredStaker.address}).should.be.rejectedWith(SolRevert)
    })

    /*
    test require failure for updatedEndingPeriod > staker.endingPeriod and verify passing of :
    - updatedEndingPeriod > currentPeriod
    - updatedEndingPeriod <= currentPeriod + maxPeriods
    ------------------------------
      |          |         |  
    current   checkin   staker end
    */
    it('2. updated ending period not greater than staker ending period', async () => {  
      await moveForwardPeriods(3)
      await spankbank.updatePeriod()
      currentPeriod = await spankbank.currentPeriod()
      checkInPeriod = parseInt(currentPeriod) + 1
      expiredBankedStaker = await getStaker(expiredStaker.address)
      
      expect(checkInPeriod).to.be.above( parseInt(currentPeriod) )
      expiredBankedStaker.endingPeriod.should.be.bignumber.above( checkInPeriod )
      expect(checkInPeriod).to.be.below(parseInt(currentPeriod) + maxPeriods)
      await spankbank.checkIn(faultyCheckInPeriod, {from: expiredStaker.address}).should.be.rejectedWith(SolRevert)
    })

    /*
    test require failure for updatedEndingPeriod <= currentPeriod + maxPeriods and verify passing of :
    - updatedEndingPeriod > staker.endingPeriod
    - updatedEndingPeriod > currentPeriod
    ---------------------------------------------
      |           |  (more than max period)  |  
    current   staker end                  checkin
    */
    it('3. updated ending period greater than current period + max period', async () => {  
      currentPeriod = await spankbank.currentPeriod()
      expiredBankedStaker = await getStaker(expiredStaker.address)

      checkInPeriod = parseInt(expiredBankedStaker.endingPeriod) + maxPeriods + 1
      currentPeriod.should.be.bignumber.below( checkInPeriod )
      expiredBankedStaker.endingPeriod.should.be.bignumber.below( checkInPeriod )
      checkInPeriod.should.be.above( parseInt(currentPeriod) + maxPeriods )

      await spankbank.checkIn(checkInPeriod, {from: expiredStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('SUCCESS!', async () => {  
      currentPeriod = await spankbank.currentPeriod()
      expiredBankedStaker = await getStaker(expiredStaker.address)

      checkInPeriod = parseInt(expiredBankedStaker.endingPeriod) + 1
      currentPeriod.should.be.bignumber.below( checkInPeriod )
      expiredBankedStaker.endingPeriod.should.be.bignumber.below( checkInPeriod )
      checkInPeriod.should.not.be.above( parseInt(currentPeriod) + maxPeriods )

      await spankbank.checkIn(checkInPeriod, {from: expiredStaker.address})
    })
  })
})


contract('SpankBank::claimBooty', (accounts) => {
  before('deploy', async () => {    
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    staker = {
      address : accounts[0],
      stake : 100,
      periods : 1
    }

    await bootyToken.transfer(spankbank.address, data.spankbank.initialBootySupply, {from: staker.address})
    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
    
    alreadyClaimedStaker = {
      address : accounts[9],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(alreadyClaimedStaker.address, 100, {from: staker.address})
    await spankToken.approve(spankbank.address, alreadyClaimedStaker.stake, {from: alreadyClaimedStaker.address})


    mintingNotCompleteStaker = {
      address : accounts[8],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(mintingNotCompleteStaker.address, 100, {from: staker.address})
    await spankToken.approve(spankbank.address, mintingNotCompleteStaker.stake, {from: mintingNotCompleteStaker.address})

    transferFailStaker = {
      address : accounts[7],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(transferFailStaker.address, 100, {from: staker.address})
    await spankToken.approve(spankbank.address, transferFailStaker.stake, {from: transferFailStaker.address})
  })

  describe('claiming BOOTY has four requirements\n\t1. claiming period must be less than the current period\n\t2. staker must not have claimed for claiming period\n\t3. minting of booty must have been attempted for the claiming period\n\t4.transfer complete (not verified in tests)', () => {
    it('1. claim period is not less than current period', async () => {   
      await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})
      
      periodWhenStaked = await spankbank.currentPeriod()

      await moveForwardPeriods(1)
      await spankbank.mintBooty()

      currentPeriod = await spankbank.currentPeriod()
      claimPeriod = currentPeriod
      currentPeriod.should.be.bignumber.equal(claimPeriod) // 1. fail

      didClaimBooty = await spankbank.getDidClaimBooty(staker.address, parseInt(periodWhenStaked))
      expect(didClaimBooty).to.be.false //2. pass

      perviousPeriod = await getPeriod(currentPeriod-1)
      expect(perviousPeriod.mintingComplete).to.be.true //3. pass

      bootyTotal = await bootyToken.balanceOf.call(spankbank.address)
      bootyTotal.should.be.bignumber.above(0) // 4. pass

      await spankbank.claimBooty(claimPeriod, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('2. staker alraedy claimed booty for period', async () => {   
      await spankbank.stakeFromPrivateKey(alreadyClaimedStaker.stake, alreadyClaimedStaker.periods, alreadyClaimedStaker.address, alreadyClaimedStaker.address, {from : alreadyClaimedStaker.address})

      currentPeriod = await spankbank.currentPeriod()
      perviousPeriod = parseInt(currentPeriod) - 1
      await spankbank.claimBooty(perviousPeriod, {from: alreadyClaimedStaker.address}) // successfully claim

      perviousPeriodData = await getPeriod(currentPeriod-1)
      expect(perviousPeriod).to.be.below(parseInt(currentPeriod)) // 1. pass
      
      afterClaimBooty = await spankbank.getDidClaimBooty(alreadyClaimedStaker.address, parseInt(perviousPeriod))
      expect(afterClaimBooty).to.be.true // 2. fail

      expect(perviousPeriodData.mintingComplete).to.be.true //3. pass
      
      bootyTotal = await bootyToken.balanceOf.call(spankbank.address)
      bootyTotal.should.be.bignumber.above(0) // 4. pass

      await spankbank.claimBooty(perviousPeriod, {from: alreadyClaimedStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('3. did not mint for the period', async () => {   
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()

      await spankbank.stakeFromPrivateKey(mintingNotCompleteStaker.stake, mintingNotCompleteStaker.periods, mintingNotCompleteStaker.address, mintingNotCompleteStaker.address, {from : mintingNotCompleteStaker.address})

      currentPeriod = await spankbank.currentPeriod()
      perviousPeriodData = await getPeriod(currentPeriod-1)

      expect(perviousPeriod).to.be.below(parseInt(currentPeriod)) // 1. pass

      expect( await spankbank.getDidClaimBooty(mintingNotCompleteStaker.address, parseInt(periodWhenStaked)) ).to.be.false // 2. pass

      expect(perviousPeriodData.mintingComplete).to.be.false // 3. fail

      bootyTotal = await bootyToken.balanceOf.call(spankbank.address)
      bootyTotal.should.be.bignumber.above(0) // 4. pass
      
      await spankbank.claimBooty(parseInt(currentPeriod) - 1, {from: alreadyClaimedStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('SUCCESS!', async () => {
      await moveForwardPeriods(1)
      await spankbank.mintBooty()
      await spankbank.updatePeriod()

      await spankbank.stakeFromPrivateKey(transferFailStaker.stake, transferFailStaker.periods, transferFailStaker.address, transferFailStaker.address, {from : transferFailStaker.address})

      currentPeriod = await spankbank.currentPeriod()
      perviousPeriodData = await getPeriod(parseInt(currentPeriod)-1)

      expect(perviousPeriod).to.be.below(parseInt(currentPeriod)) // 1. pass

      expect( await spankbank.getDidClaimBooty(transferFailStaker.address, parseInt(periodWhenStaked)) ).to.be.false // 2. pass

      expect(perviousPeriodData.mintingComplete).to.be.true // 3. pass

      bootyTotal = await bootyToken.balanceOf.call(spankbank.address)
      bootyTotal.should.be.bignumber.above(0) // 4. pass
      
      await spankbank.claimBooty(parseInt(currentPeriod) - 1, {from: transferFailStaker.address})
    })
  })
})

contract('SpankBank::splitStake', (accounts) => {
  before('deploy', async () => {    
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    staker = {
      address : accounts[0],
      stake : 100,
      periods : 1
    }

    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
    await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

    splitStaker = {
      address : accounts[8],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(splitStaker.address, splitStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, splitStaker.stake, {from: splitStaker.address})
    await spankbank.stakeFromPrivateKey(splitStaker.stake, splitStaker.periods, splitStaker.address, splitStaker.address, {from : splitStaker.address})
  })

  describe('splitStake has four requirements\n\t1. the address to split is not address(0)\n\t2. the stake amount to be split is greater than zero\n\t3. the current period is less than the stakers ending period\n\t4. the amount to be split is less than or equal to staker\'s staker', () => {
    /*
    1. new address must be non-zero
    2. split amount must be greater than zero
    3. split amount must be less than or equal to staked amount
    4. current period must be less than ending period
    */
    it('1. new address is 0x0', async () => {
      splitAmount = staker.stake
      bankedStaker = await getStaker(staker.address)
      splitAddress = "0x0000000000000000000000000000000000000000"
      expect(splitAddress).to.be.equal("0x0000000000000000000000000000000000000000") // 1. fail
      expect(splitAmount).to.be.above(0) // 2. pass
      bankedStaker.stake.should.be.bignumber.not.below(splitAmount) // 3. pass
      bankedStaker.endingPeriod.should.be.bignumber.above( await spankbank.currentPeriod() ) // 4. pass

      await spankbank.splitStake(splitAddress, staker.address, staker.address, staker.stake, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('2. split stake amount is zero', async () => {
      splitAmount = 0
      bankedStaker = await getStaker(staker.address)
      splitAddress = staker.address
      expect(splitAddress).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(splitAmount).to.be.equal(0) // 2. fail
      bankedStaker.stake.should.be.bignumber.not.below(splitAmount) // 3. pass
      bankedStaker.endingPeriod.should.be.bignumber.above( await spankbank.currentPeriod() ) // 4. pass

      await spankbank.splitStake(splitAddress, staker.address, staker.address, splitAmount, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('3. split amount is greater than staked amount', async () => {  
      splitAmount = staker.stake + 1
      bankedStaker = await getStaker(staker.address)
      splitAddress = staker.address
      expect(splitAddress).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(splitAmount).to.be.above(0) // 2. pass
      bankedStaker.stake.should.be.bignumber.below( splitAmount ) // 3. fail
      bankedStaker.endingPeriod.should.be.bignumber.above( await spankbank.currentPeriod() ) // 4. pass
      
      await spankbank.splitStake(splitAddress, staker.address, staker.address, splitAmount, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('4. current period is greater than ending period', async () => {
      await moveForwardPeriods(2)
      await spankbank.updatePeriod()

      splitAmount = staker.stake
      bankedStaker = await getStaker(staker.address)
      splitAddress = staker.address
      expect(splitAddress).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(splitAmount).to.be.above(0) // 2. pass
      bankedStaker.stake.should.not.be.bignumber.below( splitAmount ) // 3. pass
      bankedStaker.endingPeriod.should.be.bignumber.not.above( await spankbank.currentPeriod() ) // 4. fail
      
      await spankbank.splitStake( staker.address, staker.address, staker.address, staker.stake, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('SUCCESS!', async () => {
      newStaker = {
        address : accounts[7]
      }
      splitAmount = splitStaker.stake
      bankedStaker = await getStaker(splitStaker.address)
      splitAddress = newStaker.address
      expect(splitAddress).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(splitAmount).to.be.above(0) // 2. pass
      bankedStaker.stake.should.not.be.bignumber.below( splitAmount ) // 3. pass
      bankedStaker.endingPeriod.should.be.bignumber.above( await spankbank.currentPeriod() ) // 4. pass
      
      await spankbank.splitStake( staker.address, staker.address, staker.address, staker.stake, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })
  })
})

contract('SpankBank::withdrawStake', (accounts) => {
  before('deploy', async () => {    
    //owner = accounts[0]
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    staker = {
      address : accounts[0],
      stake : 100,
      periods : 12
    }

    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
    await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})
  })

  describe('withdraw stake has one requirement\n\t1. current period must be greater than staker ending period', () => {
    it('1. staking period has not ended', async () => {   
      balance = await spankToken.balanceOf(staker.address)
      bankedStaker = await getStaker(staker.address)
      delegateKey = await spankbank.getStakerFromDelegateKey(staker.address)
      await moveForwardPeriods(3)
      await spankbank.updatePeriod()
      bankedStaker = await getStaker(staker.address)

      bankedStaker.endingPeriod.should.be.bignumber.above( await spankbank.currentPeriod() ) // 1. fail
      await spankbank.withdrawStake().should.be.rejectedWith(SolRevert)
    })
    it('SUCCESS!', async () => {
      bankedStaker = await getStaker(staker.address)
      fastForward = parseInt(bankedStaker.endingPeriod) + 1
      // console.log('bankedStaker.endingPeriod', bankedStaker.endingPeriod)
      currentPeriod = await spankbank.currentPeriod()
      // console.log('before currentPeriod', currentPeriod)
      await moveForwardPeriods(fastForward)
      await spankbank.updatePeriod()
      currentPeriod = await spankbank.currentPeriod()
      // console.log('after currentPeriod', currentPeriod)

      bankedStaker.endingPeriod.should.be.bignumber.below( await spankbank.currentPeriod() ) // 1. pass
      await spankbank.withdrawStake()
    })
  })
})

contract('SpankBank::updateDelegateKey', (accounts) => {
  before('deploy', async () => {    
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    staker = {
      address : accounts[0],
      stake : 100,
      periods : 12
    }

    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
    await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

    newStaker = {
      address : accounts[1],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(newStaker.address, newStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, newStaker.stake, {from: newStaker.address})
    await spankbank.stakeFromPrivateKey(newStaker.stake, newStaker.periods, newStaker.address, newStaker.address, {from : newStaker.address})
  })

  describe('updating delegate key has three requirements\n\t1. new delegate key address is not address(0)\n\t2. delegate key is not already in use\n\t3. staker has a valid delegate key to update', () => {
    it('1. new delegate key is 0x0', async () => {
      newDelegateKey = "0x0000000000000000000000000000000000000000"
      bankedStaker = await getStaker(staker.address)
      stakerDelegateKey = await spankbank.getStakerFromDelegateKey(newDelegateKey)

      expect(newDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 1. fail
      expect(stakerDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 2. pass
      bankedStaker.delegateKey.should.not.be.equal("0x0000000000000000000000000000000000000000") // 3. pass
      
      await spankbank.updateDelegateKey(newDelegateKey, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })
    it('2. delegate key already assigned', async () => {
      newDelegateKey = newStaker.address
      newStakerDelegateKey = await spankbank.getStakerFromDelegateKey(newStaker.address)
      bankedStaker = await getStaker(staker.address)
      expect(newDelegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(newStakerDelegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 2. fail
      bankedStaker.delegateKey.should.not.be.equal("0x0000000000000000000000000000000000000000") // 3. pass

      await spankbank.updateDelegateKey(newStaker.address, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })
    it('3. staker does not have valid delegate key', async () => {
      unknownStaker = {
        address : accounts[9]
      }
      unknownDelegateKey = {
        address : accounts[8]
      }
      unknownStakerDelegateKey = await spankbank.getStakerFromDelegateKey(unknownStaker.address)
      unknownBankedStaker = await getStaker(unknownStaker.address)
      expect(unknownStaker).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(unknownStakerDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 2. pass
      unknownBankedStaker.delegateKey.should.be.equal("0x0000000000000000000000000000000000000000") // 3. fail

      await spankbank.updateDelegateKey(unknownDelegateKey.address, {from: unknownStaker.address}).should.be.rejectedWith(SolRevert)
    })
    it('SUCCESS!', async () => {
      newDelegateKey = accounts[7]
      newDelegateKeyStakerAddress = await spankbank.getStakerFromDelegateKey(newDelegateKey)
      bankedStaker = await getStaker(staker.address)
      expect(newDelegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(newDelegateKeyStakerAddress).to.be.equal("0x0000000000000000000000000000000000000000") // 2. pass
      bankedStaker.delegateKey.should.not.be.equal("0x0000000000000000000000000000000000000000") // 3. pass

      await spankbank.updateDelegateKey(newDelegateKey, {from: staker.address})
    })
  })
})

contract('SpankBank::updateBootyBase', (accounts) => {
  before('deploy', async () => {    
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    staker = {
      address : accounts[0],
      stake : 100,
      periods : 12
    }

    newStaker = {
      address : accounts[1]
    }

    newBootyBase = {
      address : accounts[2]
    }

    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
    await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})
  })

  describe('updating booty base has one requirement\n\t1. staker must have SPANK staked', () => {
    it('user does not have enough SPANK to stake', async () => {
      newBankedStaker = await getStaker(newStaker.address)
      newBankedStaker.stake.should.be.bignumber.equal(0) // 1. fail

      await spankbank.updateBootyBase(newBootyBase.address, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
    })
    it('SUCCESS!', async () => {
      bankedStaker = await getStaker(staker.address)
      bankedStaker.stake.should.be.bignumber.above(0) // 1. pass

      await spankbank.updateBootyBase(newBootyBase.address, {from : staker.address})
    })
  })
})

contract('SpankBank::voteToClose', (accounts) => {
  before('deploy', async () => {    
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    
    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    staker = {
      address : accounts[0],
      stake : 100,
      periods : 1
    }

    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
    await spankbank.stakeFromPrivateKey(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

    zeroStaker = {
      address : accounts[8],
      stake : 100
    }

    await spankToken.transfer(zeroStaker.address, zeroStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, zeroStaker.stake, {from: zeroStaker.address})


    splitStaker = {
      address : accounts[8],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(splitStaker.address, splitStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, splitStaker.stake, {from: splitStaker.address})

    closedVoteStaker = {
      address : accounts[9],
      stake: 100
    }

    await spankToken.transfer(closedVoteStaker.address, closedVoteStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, closedVoteStaker.stake, {from: closedVoteStaker.address})    

    voteBreakStaker = {
      address : accounts[7],
      stake : 500,
      periods: 12
    }

    await spankToken.transfer(voteBreakStaker.address, voteBreakStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, voteBreakStaker.stake, {from: voteBreakStaker.address})

    randomStaker = {
      address : accounts[6],
      stake: 100,
      periods: 12
    }

    await spankToken.transfer(randomStaker.address, randomStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, randomStaker.stake, {from: randomStaker.address})

  })

  describe('votetoClose has four requires\n\t1. staker spank is greater than zero\n\t2. ending period >= current period\n\t3. staker has not already voted to close in current period\n\t4. spankbank is not closed', () => {
    it('1. staker spank is zero', async () => {     
      /* 
      staker begins with zero stake  
      */
      bankedZeroStaker = await getStaker(zeroStaker.address)
      bankedZeroStaker.address.should.be.equal(zeroStaker.address)
      bankedZeroStaker.stake.should.be.bignumber.equal(0)

      /* verify voteToCloseEvent failure */
      await spankbank.voteToClose({ from : zeroStaker.address }).should.be.rejectedWith(SolRevert)

      /* 
      split stake so that staker has zero spank while still meeting other require(ments)
      1. stake
      2. validate stake
      3. split stake
      4. validate split stake event
      5. validate stakers after split stake
      */

      /* stake */
      await spankbank.stakeFromPrivateKey(splitStaker.stake, splitStaker.periods, splitStaker.address, splitStaker.address, {from : splitStaker.address})
      
      /* validate stake */
      expect(await didStake( splitStaker.address, await spankbank.currentPeriod() )).to.be.true
      
      /* split stake */
      stakerFromSplit = { address : accounts[5] }
      splitTx = await spankbank.splitStake(stakerFromSplit.address, stakerFromSplit.address, stakerFromSplit.address, splitStaker.stake, { from: splitStaker.address })

      /* validate split stake event */
      splitStakeEventPayload = await getEventParams(splitTx, "SplitStakeEvent")
      expect(
        await validateSplitStakeEvent ( 
          await spankbank.currentPeriod(),
          splitStaker.stake,  
          await getStaker(splitStaker.address),  
          await getStaker(stakerFromSplit.address), 
          splitStakeEventPayload)
      ).to.be.true
      
      /* validate stakers after split stake */
      currentPeriod = await spankbank.currentPeriod()
      bankedSplitStaker = await getStaker(splitStaker.address)
      bankedSplitStaker.address.should.be.equal(splitStaker.address)
      bankedSplitStaker.stake.should.be.bignumber.equal(0)
      bankedSplitStaker.endingPeriod.should.be.bignumber.above(parseInt( await spankbank.currentPeriod() ))

      /* verify voteToCloseEvent failure */
      await spankbank.voteToClose({from : splitStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('2. staker ending period is less than current period', async () => {
      /*
      1. staker has more than zero SPANK staked
      2. staker votedToClose for currentPeriod is false
      3. isClosed is false
      */

      await moveForwardPeriods(staker.periods+1)
      await spankbank.updatePeriod()
      currentPeriod = await spankbank.currentPeriod()

      bankedStaker = await getStaker(staker.address)
      bankedStaker.address.should.be.equal(staker.address)

      /* staker has more than zero SPANK staked */
      bankedStaker.stake.should.be.bignumber.above(0)
      bankedStaker.stake.should.be.bignumber.equal(staker.stake)
      
      /* staker votedToClose for currentPeriod is false */
      expect(await spankbank.getVote(staker.address, currentPeriod)).to.be.false

      /* isClosed is false */
      expect(await spankbank.isClosed()).to.be.false
      
      /* verify staker ending period is less than current period */
      bankedStaker.endingPeriod.should.be.bignumber.below(parseInt(currentPeriod))
      
      /* verify voteToCloseEvent failure */
      await spankbank.voteToClose({from : staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('3. staker already voted to close', async () => { 
      closedVoteStaker.stake = 100
      closedVoteStaker.periods = 12
      await spankbank.stakeFromPrivateKey(closedVoteStaker.stake, closedVoteStaker.periods, closedVoteStaker.address, closedVoteStaker.address, {from : closedVoteStaker.address})

      voteToCloseTx = await spankbank.voteToClose({from : closedVoteStaker.address})

      /* verify voteToClose event */
      payload = await getEventParams(voteToCloseTx, "VoteToCloseEvent")
      payload.staker.should.be.equal(closedVoteStaker.address)
      payload.spankStaked.should.be.bignumber.equal(closedVoteStaker.stake)
      
      
      /* verify staker */
      currentPeriod = await spankbank.currentPeriod()
      closedBankedStaker = await getStaker(closedVoteStaker.address)
      closedBankedStaker.endingPeriod.should.be.bignumber.above(parseInt(currentPeriod))
      expect(await spankbank.getVote(closedBankedStaker.address, parseInt(currentPeriod))).to.be.true
      expect(await spankbank.isClosed()).to.be.false

      await spankbank.voteToClose({from : closedVoteStaker.address}).should.be.rejectedWith(SolRevert)

    })

    it('4. contract is already closed', async () => { 
      randomStakerTx = await spankbank.stakeFromPrivateKey(randomStaker.stake, randomStaker.periods, randomStaker.address, randomStaker.address, {from : randomStaker.address})

      stakePayload = await getEventParams(randomStakerTx, "StakeEvent")
      
      await spankbank.stakeFromPrivateKey(voteBreakStaker.stake, voteBreakStaker.periods, voteBreakStaker.address, voteBreakStaker.address, {from : voteBreakStaker.address})

      voteTx = await spankbank.voteToClose({from : voteBreakStaker.address})
      
      /* verify voteToClose event */
      votePayload = await getEventParams(voteTx, "VoteToCloseEvent")
      votePayload.staker.should.be.equal(voteBreakStaker.address)
      votePayload.spankStaked.should.be.bignumber.equal(voteBreakStaker.stake)
      
      /* verify staker */
      currentPeriod = await spankbank.currentPeriod()
      voteBreakBankedStaker = await getStaker(voteBreakStaker.address)
      voteBreakBankedStaker.endingPeriod.should.be.bignumber.above(parseInt(currentPeriod))
      expect(await spankbank.getVote(voteBreakBankedStaker.address, parseInt(currentPeriod))).to.be.true
      expect(await spankbank.isClosed()).to.be.true

      await spankbank.voteToClose({from : randomStaker.address}).should.be.rejectedWith(SolRevert)
    })
  })
})
