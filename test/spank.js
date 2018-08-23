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

async function snapshot() {
  await ethRPC.sendAsync({method: `evm_snapshot`, id:0}, (err)=> {});
}

async function restore() {
  // TODO console.log('WTF THIS DOES NOTHING')
  await ethRPC.sendAsync({method: `evm_revert`, id:0}, (err)=> {});
}

contract('SpankBank', (accounts) => {
  before('deploy contracts', async () => {
    // TODO why can't these be shared global references?
    // TODO why not deploy the contracts once, then do this sequence in
    // a before each?
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    multisig = await MultiSigWallet.deployed()

    maxPeriods = parseInt(await spankbank.maxPeriods())
    // TODO is this inititalPeriodData used anywhere?

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




const wait = timeout => new Promise(resolve => setTimeout(resolve, timeout))

contract('SpankBank', (accounts) => {
  before('before 1.0', async () => {
    await wait(1)
    console.log('before 1.0')
  })

  beforeEach('beforeEach', async () => {
    await wait(1)
    console.log('beforeEach 1.0')
  })

  describe('test suite 1', () => {
    it('test 1.1', async () => {
      await wait(1)
      console.log('test 1.1')
    })

    it('test 1.2', async () => {
      await wait(1)
      console.log('test 1.2')
    })
  })

  describe('test suite 2', () => {
    it('test 2.1', async () => {
      await wait(1)
      console.log('test 2.1')
    })

    it('test 2.2', async () => {
      await wait(1)
      console.log('test 2.2')
    })

    describe('nested test suite 2.3', () => {

      // what happens if more before / beforeEach?

      before('before 2.3', async () => {
        await wait(1)
        console.log('before 2.3')
      })

      beforeEach('beforeEach 2.3', async () => {
        await wait(1)
        console.log('beforeEach 2.3')
      })

      it('test 2.3.1', async () => {
        await wait(1)
        console.log('test 2.3.1')
      })

      it('test 2.3.2', async () => {
        await wait(1)
        console.log('test 2.3.2')
      })

    })
  })
})

