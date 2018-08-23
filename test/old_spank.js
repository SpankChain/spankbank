// TODO:
// 0. wtf - how did we get to period 17? what is the period length? where is it
//    set?
// 1. decide if I want to re-deploy contracts for each test, or reference?
//  - is deploying the slow part, or compiling?
//  - can't reset currentPeriod to 0 without re-deploying...
// 2. reduce redundant refernce instantiation "before" tests
// 3. ensure tests are comprehensive
// 4. make sure require contract errors are displayed - wrap in try/catch
// 5. reduce redundant staker profiles / make them more distinct
// 6. (maybe) use assert over expect

// const {injectInTruffle} = require(`sol-trace`)
// injectInTruffle(web3, artifacts);
const HttpProvider = require(`ethjs-provider-http`)
const EthRPC = require(`ethjs-rpc`)
const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'))

// TODO rename to BN
const BigNumber = web3.BigNumber
// TODO chai BN plugins are cool, does assert have the same thing?
const should = require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should()
const SolRevert = 'VM Exception while processing transaction: revert'

const MultiSigWallet = artifacts.require('./MultiSigWallet')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintAndBurnToken')
const SpankBank = artifacts.require('./SpankBank')

const data = require('../data.json')

async function snapshot() {
  await ethRPC.sendAsync({method: `evm_snapshot`, id:0}, (err)=> {});
}

async function restore() {
  // TODO console.log('WTF THIS DOES NOTHING')
  // await ethRPC.sendAsync({method: `evm_revert`, id:0}, (err)=> {});
}

/* convenience functions */
async function forceMine() {
  return await ethRPC.sendAsync({method: `evm_mine`}, (err)=> {});
}

async function blockTime() {
  return await web3.eth.getBlock('latest').timestamp
}

async function moveForwardPeriods(periods) {
  const blocktimestamp = await blockTime()
  const goToTime = data.spankbank.periodLength * periods
  await ethRPC.sendAsync({
    jsonrpc:'2.0', method: `evm_increaseTime`,
    params: [goToTime],
    id: 0
  }, (err)=> {`error increasing time`});
  await forceMine()
  const updatedBlocktimestamp = await blockTime()
  console.log('\t(moveForwardPeriods)')
  return true
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

function validateSplitStakeEvent(amount, staker, splitStaker, ev) {
  ev.staker.should.be.equal(staker.address)
  ev.newAddress.should.be.equal(splitStaker.address)
  ev.spankAmount.should.be.bignumber.equal(amount)
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

function extraData(periodLength, delegateKey, bootyBase) {
  sixtyFourZeros = "0000000000000000000000000000000000000000000000000000000000000000"
  periodLengthHex = periodLength.toString(16)
  delegateKey = delegateKey.split("0x")[1]
  bootyBase = bootyBase.split("0x")[1]
  periodLengthData = String(sixtyFourZeros.substring(0,sixtyFourZeros.length - periodLengthHex.length)) + periodLengthHex
  return '0x0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000' + delegateKey + '000000000000000000000000' + bootyBase + periodLengthData
}

function decToBytes(dec) {
  const sixtyFourZeros = '0000000000000000000000000000000000000000000000000000000000000000'
  return String(sixtyFourZeros.substring(0,sixtyFourZeros.length - dec.toString(16).length)) + dec.toString(16)
}

function addrToBytes(address) {
  const twentyFourZeros = '000000000000000000000000'
  const addr = address.split("0x")[1]
  return twentyFourZeros + addr
}

function multiSigApprove(_spender, _value) {
  return '0x095ea7b3' + addrToBytes(_spender) + decToBytes(_value)
}

function multiSigStake(spankAmount, stakePeriods, delegateKey, bootyBase) {
  return '0x40809acd' + decToBytes(spankAmount) + decToBytes(stakePeriods) + addrToBytes(delegateKey) + addrToBytes(bootyBase)
}

contract('SpankBank::snapshot', (accounts) => {
  it('take snapshot', async () => {
    // this snapshot means we don't have to redeploy the contracts, and
    // instead can just rollback all executed transactions
    await snapshot()
  })
})

let currentPeriod

// TODO before we test staking, we need to do 1 test for the proper init params

contract('SpankBank::stake', (accounts) => {
  before('deploy', async () => {
    await restore()
    // TODO why can't these be shared global references?
    // TODO why not deploy the contracts once, then do this sequence in
    // a before each?
    spankbank = await SpankBank.deployed()
    console.log('SPANKBANK ADDRESS')
    console.log(spankbank.address)
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    multisig = await MultiSigWallet.deployed()
    firstMsig = accounts[0]
    secondMsig = accounts[1]

    maxPeriods = parseInt(await spankbank.maxPeriods())
    // TODO is this inititalPeriodData used anywhere?
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    // TODO use a constructor function to create these
    // - by default delegateKey / bootyBase should be the same as address
    // - default stake = 100
    // - default periods = 1
    staker = {
      address : accounts[0],
      stake : 100,
      delegateKey : accounts[0],
      bootyBase : accounts[0]
    }
    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})

    newStaker = {
      // TODO why 9?
      address : accounts[9],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(newStaker.address, newStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, newStaker.stake, {from: newStaker.address})

    // receiveApproval staker
    raStaker = {
      address : accounts[3],
      stake : 100,
      delegateKey : accounts[3],
      bootyBase : accounts[3],
      periods : 12
    }

    // TODO why are the ra / ms stakers not calling approve?
    await spankToken.transfer(raStaker.address, raStaker.stake, {from: staker.address})

    // multisig staker
    msStaker = {
      address : multisig.address,
      stake : 2,
      delegateKey : multisig.address,
      bootyBase : multisig.address,
      periods : 12
    }

    await spankToken.transfer(msStaker.address, msStaker.stake, {from: staker.address})
  })


  // TODO this is a superstitious way of testing - each test is repeated to
  // ensure the only thing different about that particular test case is the
  // failing condition. The better way to do this is to do all setup inside
  // a beforeEach, make sure the initial test passes, and then *only* change
  // what is necessary inside each test. This removes a lot of the extra
  // clutter and confusion, allowing the reader to focus.

  describe('Staking has nine requirements (counting logical AND requirements individually when possible).\n\t1. stake period greater than zero \n\t2. stake period less than or equal to maxPeriods \n\t3. stake greater than zero \n\t4. startingPeriod is zero \n\t5. endingPeriod is zero \n\t6. transfer complete \n\t7. delegateKey is not 0x0 \n\t8. bootyBase is not 0x0 \n\t9. delegateKey -> stakerAddress is 0x0', () => {
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

      await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address}).should.be.rejectedWith(SolRevert)
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

      await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address}).should.be.rejectedWith(SolRevert)
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

      await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('4/5/(9). startingPeriod and EndingPeriod not zero (staker delegateKey exists)', async () => {
      staker.stake = 1
      // TODO why are we moving forward periods?
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

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

      await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address}).should.be.rejectedWith(SolRevert)
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

      await spankbank.stake(newStaker.stake, newStaker.periods, newStaker.delegateKey, newStaker.address, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
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

      await spankbank.stake(newStaker.stake, newStaker.periods, newStaker.delegateKey, newStaker.address, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
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

      await spankbank.stake(newStaker.stake, newStaker.periods, newStaker.address, newStaker.bootyBase, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
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
      expect(newStaker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(newStaker.delegateKey).to.be.equal(staker.address) // 9. fail

      await spankbank.stake(newStaker.stake, newStaker.periods, newStaker.delegateKey, newStaker.bootyBase, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('SUCCESS!', async () => {
      bankedStaker = await getStaker(newStaker.address)
      stakerBalance = await spankToken.balanceOf(newStaker.address)
      bankedDelegateKey = await spankbank.getStakerFromDelegateKey(newStaker.address)
      newStaker.delegateKey = newStaker.address
      newStaker.bootyBase = newStaker.address
      expect(newStaker.periods).to.be.above(0) // 1. pass
      expect(newStaker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(newStaker.stake).to.be.above(0) // 3. pass
      bankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      bankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      stakerBalance.should.not.be.bignumber.below(newStaker.stake) // 6. pass
      expect(newStaker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(newStaker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(bankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      await spankbank.stake(newStaker.stake, newStaker.periods, newStaker.delegateKey, newStaker.bootyBase, {from : newStaker.address})

      // receiveApproval
      raBankedStaker = await getStaker(raStaker.address)
      raStakerBalance = await spankToken.balanceOf(raStaker.address)
      raBankedDelegateKey = await spankbank.getStakerFromDelegateKey(raStaker.address)
      raStaker.delegateKey = raStaker.address
      raStaker.bootyBase = raStaker.address
      expect(raStaker.periods).to.be.above(0) // 1. pass
      expect(raStaker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(raStaker.stake).to.be.above(0) // 3. pass
      raBankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      raBankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      raStakerBalance.should.not.be.bignumber.below(raStaker.stake) // 6. pass
      expect(raStaker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(raStaker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(raBankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      // TODO shouldn't call the variable the same name as the function
      extraData = extraData(raStaker.periods, raStaker.address, raStaker.address)
      await spankToken.approveAndCall(spankbank.address, raStaker.stake, extraData, {from: raStaker.address})

      bankedStaker = await getStaker(raStaker.address)
      bankedStaker.stake.should.be.bignumber.equal(raStaker.stake)


      // multi-sig approve/stake
      msBankedStaker = await getStaker(msStaker.address)
      msStakerBalance = await spankToken.balanceOf(msStaker.address)
      msBankedDelegateKey = await spankbank.getStakerFromDelegateKey(msStaker.address)
      expect(msStaker.periods).to.be.above(0) // 1. pass
      expect(msStaker.periods).to.not.be.above(maxPeriods) // 2. pass
      expect(msStaker.stake).to.be.above(0) // 3. pass
      msBankedStaker.startingPeriod.should.be.bignumber.equal(0) // 4. pass
      msBankedStaker.endingPeriod.should.be.bignumber.equal(0) // 5. pass
      msStakerBalance.should.not.be.bignumber.below(msStaker.stake) // 6. pass
      expect(msStaker.delegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 7. pass
      expect(msStaker.bootyBase).to.not.be.equal("0x0000000000000000000000000000000000000000") // 8. pass
      expect(msBankedDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 9. pass

      await multisig.submitTransaction(spankToken.address, 0, multiSigApprove(spankbank.address, msStaker.stake), {from:secondMsig})
      approveTx = await multisig.confirmTransaction(0, {from:firstMsig})

      await multisig.submitTransaction(spankbank.address, 0, multiSigStake(msStaker.stake, msStaker.periods, msStaker.delegateKey, msStaker.bootyBase, {from : firstMsig}))
      stakeTx = await multisig.confirmTransaction(1, {from:secondMsig})

      msBankedStaker = await getStaker(msStaker.address)
      msBankedStaker.stake.should.be.bignumber.equal(msStaker.stake)
    })
  })
})

// TODO why are we repeating these variable declarations before each describe
// block? And why are we using separate contract blocks? Is there some issue
// with using nested + async beforeEach's (there was last time I tried)
// We should do this again but with a single contract deployment and
// instantiation, restore() in beforeEach
contract('SpankBank::sendFees', (accounts) => {
  before('deploy', async () => {
    await restore()
    spankbank = await SpankBank.deployed()
    console.log('SPANKBANK ADDRESS')
    console.log(spankbank.address)
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
    await bootyToken.approve(spankbank.address, 1, {from: staker.address})
  })

  describe('sending fees has two requirements\n\t1. BOOTY amount must be greater than zero\n\t2. transfer complete', () => {
    it('1. sending zero amount', async () => {
      await spankbank.sendFees(0,{frome: staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('2. transfer failure - sending more than exists', async () => {
      await spankbank.sendFees(data.spankbank.initialBootySupply*2,{from: staker.address}).should.be.rejectedWith(SolRevert)
    })
    it('SUCCESS!', async () => {
      await spankbank.sendFees(1, {from: staker.address})
    })
  })
})

contract('SpankBank::mintBooty', (accounts) => {
  before('deploy', async () => {
    await restore()
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

contract('SpankBank::checkIn', (accounts) => {
  before('deploy', async () => {
    await restore()
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
    currentPeriod = parseInt(await spankbank.currentPeriod())
    console.log('\tcurrentPeriod', currentPeriod)
    await spankbank.stake(expiredStaker.stake, expiredStaker.periods, expiredStaker.address, expiredStaker.address, {from : expiredStaker.address})
    currentPeriod = parseInt(await spankbank.currentPeriod())
    console.log('\tcurrentPeriod', currentPeriod)
  })

  describe('checking in has three requirements\n\t1. updated ending period is greater than the current period\n\t2. updated ending period is greater than the staker ending period\n\t3. the updated ending period is less than or equal to the max number of allowed periods starting from the current period\n\t4. staker spankpoints for next period is zero', () => {

    /*
    test require failure for updatedEndingPeriod > currentPeriod and verify passing of requires :
    - updatedEndingPeriod > staker.endingPeriod
    - updatedEndingPeriod <= currentPeriod + maxPeriods
    ------------------------------
      |          |         |
    checkin   current   staker end
    */

    it('1. updated ending period has already passed', async () => {
      await spankbank.updatePeriod() // interacting with contract before moving foward
      // TODO why 3 periods? is it because we're already at 10 or something?
      await moveForwardPeriods(3)
      await spankbank.updatePeriod()
      currentPeriod = parseInt(await spankbank.currentPeriod())
      console.log('\tcurrentPeriod', currentPeriod)
      faultyCheckInPeriod = parseInt(currentPeriod) - 1
      expiredBankedStaker = await getStaker(expiredStaker.address)

      spankPoints = await spankbank.getSpankPoints(expiredStaker.address, currentPeriod + 1)
      spankPoints.should.be.bignumber.equal(0)
      // error below occurs because blockchain does not reliably move forward
      // solution is to interact with contract before moving foward (line 495)
      /*
      AssertionError: expected '100' to equal '0'
      + expected - actual

      -100
      +0

      at Context.it (test/spank.js:503:39)
      */

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
    it('2. updated ending period is earlier than original ending period', async () => {
      await moveForwardPeriods(3)
      await spankbank.updatePeriod()
      currentPeriod = await spankbank.currentPeriod()
      checkInPeriod = parseInt(currentPeriod) + 1
      expiredBankedStaker = await getStaker(expiredStaker.address)

      spankPoints = await spankbank.getSpankPoints(expiredStaker.address, currentPeriod+1)
      spankPoints.should.be.bignumber.equal(0)

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
    it('3. updated ending period is beyond maximum staking limits', async () => {
      // TODO because we forgot to moveForward in this test, it should fail
      // regardless of whether or not we're beyond the staking limits... the
      // spankpoints
      currentPeriod = await spankbank.currentPeriod()
      expiredBankedStaker = await getStaker(expiredStaker.address)

      spankPoints = await spankbank.getSpankPoints(expiredStaker.address, currentPeriod+1)
      spankPoints.should.be.bignumber.equal(0)

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
      // TODO check success balances
    })

    it('4. staker spankpoints for next period is zero', async() => {
      // TODO Using the positioning of the success case prior to this case is
      // finnicky
      currentPeriod = parseInt(await spankbank.currentPeriod())
      spankPoints = await spankbank.getSpankPoints(expiredStaker.address, currentPeriod+1)
      await spankbank.checkIn(checkInPeriod, {from: expiredStaker.address}).should.be.rejectedWith(SolRevert)
    })
  })
})


contract('SpankBank::claimBooty', (accounts) => {
  before('deploy', async () => {
    await restore()
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
      address : accounts[5],
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

    claimStaker = {
      address : accounts[6],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(claimStaker.address, 100, {from: staker.address})
    await spankToken.approve(spankbank.address, claimStaker.stake, {from: claimStaker.address})
  })

  describe('claiming BOOTY has four requirements\n\t1. claiming period must be less than the current period\n\t2. staker must not have claimed for claiming period\n\t3. minting of booty must have been attempted for the claiming period\n\t4.transfer complete (not verified in tests)', () => {
    it('1. claim period is not less than current period', async () => {
      await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

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
      await spankbank.stake(alreadyClaimedStaker.stake, alreadyClaimedStaker.periods, alreadyClaimedStaker.address, alreadyClaimedStaker.address, {from : alreadyClaimedStaker.address})

      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      await spankbank.mintBooty()

      currentPeriod = await spankbank.currentPeriod()
      perviousPeriod = parseInt(currentPeriod) - 1
      await spankbank.claimBooty(perviousPeriod, {from: alreadyClaimedStaker.address}) // successfully claim

      perviousPeriodData = await getPeriod(currentPeriod-1)
      expect(perviousPeriod).to.be.below(parseInt(currentPeriod)) // 1. pass

      afterClaimBooty = await spankbank.getDidClaimBooty(alreadyClaimedStaker.address, perviousPeriod)
      expect(afterClaimBooty).to.be.true

      expect(perviousPeriodData.mintingComplete).to.be.true //3. pass

      bootyTotal = await bootyToken.balanceOf.call(spankbank.address)
      bootyTotal.should.be.bignumber.above(0) // 4. pass

      await spankbank.claimBooty(perviousPeriod, {from: alreadyClaimedStaker.address}).should.be.rejectedWith(SolRevert) // 2. fail
    })

    it('3. did not mint for the period', async () => {
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()

      await spankbank.stake(mintingNotCompleteStaker.stake, mintingNotCompleteStaker.periods, mintingNotCompleteStaker.address, mintingNotCompleteStaker.address, {from : mintingNotCompleteStaker.address})

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
      await spankbank.updatePeriod()
      await spankbank.mintBooty()

      await spankbank.stake(claimStaker.stake, claimStaker.periods, claimStaker.address, claimStaker.address, {from : claimStaker.address})

      await moveForwardPeriods(1)
      await spankbank.mintBooty()
      await spankbank.updatePeriod()

      currentPeriod = await spankbank.currentPeriod()
      perviousPeriodData = await getPeriod(parseInt(currentPeriod) - 1)

      expect(perviousPeriod).to.be.below(parseInt(currentPeriod)) // 1. pass

      expect( await spankbank.getDidClaimBooty(claimStaker.address, parseInt(periodWhenStaked)) ).to.be.false // 2. pass

      expect(perviousPeriodData.mintingComplete).to.be.true // 3. pass

      bootyTotal = await bootyToken.balanceOf.call(spankbank.address)
      bootyTotal.should.be.bignumber.above(0) // 4. pass

      currentPeriod = await spankbank.currentPeriod()
      await spankbank.claimBooty(parseInt(currentPeriod) - 1, {from: claimStaker.address})
    })
  })
})

contract('SpankBank::splitStake', (accounts) => {
  before('deploy', async () => {
    await restore()
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
    await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

    splitStaker = {
      address : accounts[8],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(splitStaker.address, splitStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, splitStaker.stake, {from: splitStaker.address})
    await spankbank.stake(splitStaker.stake, splitStaker.periods, splitStaker.address, splitStaker.address, {from : splitStaker.address})

    checkedInStaker = {
      address : accounts[5],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(checkedInStaker.address, checkedInStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, checkedInStaker.stake, {from: checkedInStaker.address})
    await spankbank.stake(checkedInStaker.stake, checkedInStaker.periods, checkedInStaker.address, checkedInStaker.address, {from : checkedInStaker.address})

    successStaker = {
      address : accounts[9],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(successStaker.address, successStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, successStaker.stake, {from: successStaker.address})
    await spankbank.stake(successStaker.stake, successStaker.periods, successStaker.address, successStaker.address, {from : successStaker.address})
  })

  describe('splitStake has five requirements\n\t1. the address to split is not address(0)\n\t2. the stake amount to be split is greater than zero\n\t3. the current period is less than the stakers ending period\n\t4. the amount to be split is less than or equal to staker\'s staker\n\t5. the staker has no spank points for current period (has not yet checked in', () => {
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

      spankPoints = await spankbank.getSpankPoints(staker.address,  await spankbank.currentPeriod())
      spankPoints.should.be.bignumber.equal(0) // 5. pass

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

      spankPoints = await spankbank.getSpankPoints(staker.address,  await spankbank.currentPeriod())
      spankPoints.should.be.bignumber.equal(0) // 5. pass

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

      spankPoints = await spankbank.getSpankPoints(staker.address,  await spankbank.currentPeriod())
      spankPoints.should.be.bignumber.equal(0) // 5. pass

      await spankbank.splitStake(splitAddress, staker.address, staker.address, splitAmount, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('4. current period is greater than ending period', async () => {
      await moveForwardPeriods(staker.periods+1)
      await spankbank.updatePeriod()
      splitAddress = staker.address
      splitAmount = staker.stake
      bankedStaker = await getStaker(staker.address)

      await moveForwardPeriods(1)
      await spankbank.updatePeriod()

      expect(splitAddress).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(splitAmount).to.be.above(0) // 2. pass
      bankedStaker.stake.should.not.be.bignumber.below( splitAmount ) // 3. pass
      bankedStaker.endingPeriod.should.be.bignumber.not.above( await spankbank.currentPeriod() ) // 4. fail

      spankPoints = await spankbank.getSpankPoints(staker.address,  await spankbank.currentPeriod())
      spankPoints.should.be.bignumber.equal(0) // 5. pass

      await spankbank.splitStake( staker.address, staker.address, staker.address, staker.stake, {from: staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('5. the staker has no spank points for current period (has not yet checked in yet)', async () => {
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      currentPeriod = parseInt(await spankbank.currentPeriod())

      checkedInBankedStaker = await getStaker(checkedInStaker.address)


      newStaker = {
        address : accounts[6]
      }
      splitAmount = successStaker.stake
      bankedStaker = await getStaker(successStaker.address)
      splitAddress = newStaker.address
      expect(newStaker).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(splitAmount).to.be.above(0) // 2. pass
      bankedStaker.stake.should.not.be.bignumber.below( splitAmount ) // 3. pass
      bankedStaker.endingPeriod.should.be.bignumber.above( currentPeriod ) // 4. pass


      await spankbank.checkIn( parseInt(checkedInBankedStaker.endingPeriod) + 1, {from: checkedInStaker.address})

      currentPeriod = parseInt(await spankbank.currentPeriod())
      spankPoints = await spankbank.getSpankPoints(checkedInStaker.address, currentPeriod + 1)
      spankPoints.should.be.bignumber.above(0)

      newStaker = {
        address : accounts[4]
      }

      await spankbank.splitStake(newStaker.address, newStaker.address, newStaker.address, checkedInStaker.stake, {from: checkedInStaker.address}).should.be.rejectedWith(SolRevert) // 5.fail
    })


    it('SUCCESS!', async () => {
      newStaker = {
        address : accounts[6]
      }
      splitAmount = successStaker.stake
      bankedStaker = await getStaker(successStaker.address)
      splitAddress = newStaker.address
      expect(newStaker).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
      expect(splitAmount).to.be.above(0) // 2. pass
      bankedStaker.stake.should.not.be.bignumber.below( splitAmount ) // 3. pass
      bankedStaker.endingPeriod.should.be.bignumber.above( await spankbank.currentPeriod() ) // 4. pass
      await spankbank.splitStake(newStaker.address, newStaker.address, newStaker.address, splitAmount, {from: successStaker.address}) // 5. pass
    })
  })
})

contract('SpankBank::updateDelegateKey', (accounts) => {
  before('deploy', async () => {
    await restore()
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
    await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

    newStaker = {
      address : accounts[1],
      stake : 100,
      periods : 12
    }

    await spankToken.transfer(newStaker.address, newStaker.stake, {from: staker.address})
    await spankToken.approve(spankbank.address, newStaker.stake, {from: newStaker.address})
    await spankbank.stake(newStaker.stake, newStaker.periods, newStaker.address, newStaker.address, {from : newStaker.address})
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
    await restore()
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
    await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})
  })

  describe('updating booty base has one requirement\n\t1. staker must have SPANK staked', () => {
    it('user does not have enough SPANK to stake', async () => {
      newBankedStaker = await getStaker(newStaker.address)
      newBankedStaker.stake.should.be.bignumber.equal(0)

      await spankbank.updateBootyBase(newBootyBase.address, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
    })
    it('SUCCESS!', async () => {
      bankedStaker = await getStaker(staker.address)
      bankedStaker.stake.should.be.bignumber.above(0)

      await spankbank.updateBootyBase(newBootyBase.address, {from : staker.address})
    })
  })
})

contract('SpankBank::voteToClose', (accounts) => {
  before('deploy', async () => {
    const blocktimestamp = await blockTime()
    console.log('time before restore')
    console.log(blocktimestamp)
    await restore()
    const blocktimestamp2 = await blockTime()
    console.log('time after restore')
    console.log(blocktimestamp2)
    console.log('difference in seconds')
    console.log(blocktimestamp2 - blocktimestamp)
    // figured it out - restore doesnt reset the block time...which sort of
    // makes sense
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)

    maxPeriods = parseInt(await spankbank.maxPeriods())
    initialPeriodData = await spankbank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankbank.periodLength())

    console.log('periodLength')
    console.log(periodLength)

    console.log('startTime')
    console.log(startTime)
    console.log('endTime')
    console.log(endTime)
    currentPeriod = await spankbank.currentPeriod()
    console.log('currentPeriod')
    console.log(parseInt(currentPeriod))

    staker = {
      address : accounts[0],
      stake : 100,
      periods : 1
    }

    await spankToken.approve(spankbank.address, staker.stake, {from: staker.address})
    await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

    currentPeriod = await spankbank.currentPeriod()
    console.log('currentPeriod')
    console.log(parseInt(currentPeriod))

    zeroStaker = {
      address : accounts[6],
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

  describe('votetoClose has four requires\n\t1. staker spank is greater than zero\n\t2. ending period >= current period\n\t3. staker has not already voted to close in current period\n\t4. spankbank is not closed, \n\tEX. withdraw after SpankBank is closed', () => {

    it('1.1 staker spank is zero', async () => {
      bankedZeroStaker = await getStaker(zeroStaker.address)
      bankedZeroStaker.address.should.be.equal(zeroStaker.address)
      bankedZeroStaker.stake.should.be.bignumber.equal(0)

      // this is only working when run in isolation
      // something about the rest of the tests changes the context for this one
      // 1. the before script isn't properly running when we use only
      // 2. the balances are shifted
      // 3. blockchain state isn't properly initialized
      // need to find out exactly why it is failing and which values are diff
      //
      // Why is current period 17 if we are properly restoring?

      currentPeriod = await spankbank.currentPeriod()
      console.log('currentPeriod')
      console.log(parseInt(currentPeriod))
      await spankbank.voteToClose({ from : zeroStaker.address }).should.be.rejectedWith(SolRevert)
      console.log('currentPeriod')
      console.log(parseInt(currentPeriod))
    })

    it('1.2 staker splitStakes all spank and voteToClose', async () => {
      console.log('splitStaker.stake')
      console.log(splitStaker.stake)
      console.log('splitStaker.periods')
      console.log(splitStaker.periods)
      console.log('splitStaker.address')
      console.log(splitStaker.address)
      await spankbank.stake(splitStaker.stake, splitStaker.periods, splitStaker.address, splitStaker.address, {from : splitStaker.address})

      expect(await didStake( splitStaker.address, await spankbank.currentPeriod() )).to.be.true

      currentPeriod = await spankbank.currentPeriod()
      console.log('currentPeriod')
      console.log(parseInt(currentPeriod))
      await moveForwardPeriods(1)
      console.log('1')
      await spankbank.updatePeriod()
      console.log('2')
      currentPeriod = await spankbank.currentPeriod()
      console.log('currentPeriod')
      console.log(parseInt(currentPeriod))
      console.log('splitStaker.stake')
      console.log(splitStaker.stake)

      stakerFromSplit = { address : accounts[5] }
      splitTx = await spankbank.splitStake(stakerFromSplit.address, stakerFromSplit.address, stakerFromSplit.address, splitStaker.stake, { from: splitStaker.address })
      console.log('3')


      splitStakeEventPayload = await getEventParams(splitTx, "SplitStakeEvent")
      expect(
        await validateSplitStakeEvent (
          splitStaker.stake,
          await getStaker(splitStaker.address),
          await getStaker(stakerFromSplit.address),
          splitStakeEventPayload
        )
      ).to.be.true

      currentPeriod = await spankbank.currentPeriod()
      console.log('currentPeriod')
      console.log(currentPeriod)
      bankedSplitStaker = await getStaker(splitStaker.address)
      bankedSplitStaker.address.should.be.equal(splitStaker.address)
      bankedSplitStaker.stake.should.be.bignumber.equal(0)
      bankedSplitStaker.endingPeriod.should.be.bignumber.above(parseInt( await spankbank.currentPeriod() ))
      console.log('bankedSplitStaker.address')
      console.log(bankedSplitStaker.address)
      console.log('bankedSplitStaker.stake')
      console.log(bankedSplitStaker.stake)
      console.log('bankedSplitStaker.endingPeriod')
      console.log(bankedSplitStaker.endingPeriod)
      await spankbank.voteToClose({from : splitStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('2. staker ending period is less than current period', async () => {
      await moveForwardPeriods(staker.periods * 2)
      await spankbank.updatePeriod()

      bankedStaker = await getStaker(staker.address)
      bankedStaker.address.should.be.equal(staker.address)
      bankedStaker.stake.should.be.bignumber.above(0)
      bankedStaker.stake.should.be.bignumber.equal(staker.stake)

      expect(await spankbank.getVote(staker.address, currentPeriod)).to.be.false
      expect(await spankbank.isClosed()).to.be.false

      await spankbank.updatePeriod()
      currentPeriod = await spankbank.currentPeriod()
      bankedStaker.endingPeriod.should.be.bignumber.below(parseInt(currentPeriod))
      await spankbank.voteToClose({from : staker.address}).should.be.rejectedWith(SolRevert)
    })

    it('3. staker already voted to close', async () => {
      closedVoteStaker.stake = 100
      closedVoteStaker.periods = 12
      await spankbank.stake(closedVoteStaker.stake, closedVoteStaker.periods, closedVoteStaker.address, closedVoteStaker.address, {from : closedVoteStaker.address})

      voteToCloseTx = await spankbank.voteToClose({from : closedVoteStaker.address})
      payload = await getEventParams(voteToCloseTx, "VoteToCloseEvent")
      payload.staker.should.be.equal(closedVoteStaker.address)

      currentPeriod = await spankbank.currentPeriod()
      closedBankedStaker = await getStaker(closedVoteStaker.address)
      closedBankedStaker.endingPeriod.should.be.bignumber.above(parseInt(currentPeriod))
      expect(await spankbank.getVote(closedBankedStaker.address, parseInt(currentPeriod))).to.be.true
      expect(await spankbank.isClosed()).to.be.false

      await spankbank.voteToClose({from : closedVoteStaker.address}).should.be.rejectedWith(SolRevert)

    })

    it('4. contract is already closed', async () => {
      randomStakerTx = await spankbank.stake(randomStaker.stake, randomStaker.periods, randomStaker.address, randomStaker.address, {from : randomStaker.address})

      stakePayload = await getEventParams(randomStakerTx, "StakeEvent")

      await spankbank.stake(voteBreakStaker.stake, voteBreakStaker.periods, voteBreakStaker.address, voteBreakStaker.address, {from : voteBreakStaker.address})
      voteTx = await spankbank.voteToClose({from : voteBreakStaker.address})

      votePayload = await getEventParams(voteTx, "VoteToCloseEvent")
      votePayload.staker.should.be.equal(voteBreakStaker.address)

      currentPeriod = await spankbank.currentPeriod()
      voteBreakBankedStaker = await getStaker(voteBreakStaker.address)
      voteBreakBankedStaker.endingPeriod.should.be.bignumber.above(parseInt(currentPeriod))
      expect(await spankbank.getVote(voteBreakBankedStaker.address, parseInt(currentPeriod))).to.be.true
      expect(await spankbank.isClosed()).to.be.true

      await spankbank.voteToClose({from : randomStaker.address}).should.be.rejectedWith(SolRevert)
    })

    it('EX. withdraw after SpankBank is closed', async () => {
      bankedZeroStaker = await getStaker(voteBreakStaker.address)
      await spankbank.withdrawStake({from : voteBreakStaker.address})
    })
  })
})

contract('SpankBank::withdrawStake', (accounts) => {
  before('deploy', async () => {
    await restore()
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
    await spankbank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})
  })

  describe('withdraw stake has one requirement\n\t1. current period must be greater than staker ending period', () => {
    it('1. staking period has not ended', async () => {
      balance = await spankToken.balanceOf(staker.address)
      bankedStaker = await getStaker(staker.address)
      delegateKey = await spankbank.getStakerFromDelegateKey(staker.address)
      await moveForwardPeriods(3)
      await spankbank.updatePeriod()
      bankedStaker = await getStaker(staker.address)

      bankedStaker.endingPeriod.should.be.bignumber.above( await spankbank.currentPeriod() )
      await spankbank.withdrawStake().should.be.rejectedWith(SolRevert)
    })
    it('SUCCESS!', async () => {
      await spankbank.updatePeriod() // interacting with contract before moving foward
      await moveForwardPeriods(staker.periods + 2)
      await spankbank.updatePeriod()
      currentPeriod = await spankbank.currentPeriod()
      // console.log('\tcurrentPeriod', currentPeriod)
      bankedStaker = await getStaker(staker.address)
      bankedStaker.endingPeriod.should.be.bignumber.below( currentPeriod )
      // error below occurs because blockchain does not reliably move forward
      // solution is to interact with contract before moving foward (line 1268)
      /*
      AssertionError: expected '12' to be less than '3'
      + expected - actual

      -12
      +3

      at Context.it (test/spank.js:1271:53)
      at <anonymous>
      at process._tickCallback (internal/process/next_tick.js:160:7)
      */
      await spankbank.withdrawStake()
    })
  })
})

