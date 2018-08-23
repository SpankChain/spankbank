// TODO
// 1. test each value of spankpoints (stake for each possible period)
// 2. test staking with different delegateKey/bootyBase values
// 3. console logs arent happening - do I need to use promise based assertions?
// 4. not sure what tests should be done in separate msig file

// const {injectInTruffle} = require(`sol-trace`)
// injectInTruffle(web3, artifacts);

const { decToBytes, addrToBytes } = require('./utils')

const HttpProvider = require(`ethjs-provider-http`)
const EthRPC = require(`ethjs-rpc`)
const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'))

const BigNumber = web3.BigNumber

const should = require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should()
const SolRevert = 'VM Exception while processing transaction: revert'

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintAndBurnToken')
const SpankBank = artifacts.require('./SpankBank')

const MultiSigWallet = artifacts.require('./MultiSigWallet')

const data = require('../data.json')

async function snapshot() {
  return new Promise((accept, reject) => {
    ethRPC.sendAsync({method: `evm_snapshot`}, (err, result)=> {
      if (err) {
        reject(err)
      } else {
        accept(result)
      }
    })
  })
}

async function restore(snapshotId) {
  return new Promise((accept, reject) => {
    ethRPC.sendAsync({method: `evm_revert`, params: [snapshotId]}, (err, result) => {
      if (err) {
        reject(err)
      } else {
        accept(result)
      }
    })
  })
}

function makeExtraData(periodLength, delegateKey, bootyBase) {
  sixtyFourZeros = "0000000000000000000000000000000000000000000000000000000000000000"
  periodLengthHex = periodLength.toString(16)
  delegateKey = delegateKey.split("0x")[1]
  bootyBase = bootyBase.split("0x")[1]
  periodLengthData = String(sixtyFourZeros.substring(0,sixtyFourZeros.length - periodLengthHex.length)) + periodLengthHex
  return '0x0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000' + delegateKey + '000000000000000000000000' + bootyBase + periodLengthData
}

function multiSigApprove(_spender, _value) {
  return '0x095ea7b3' + addrToBytes(_spender) + decToBytes(_value)
}

function multiSigStake(spankAmount, stakePeriods, delegateKey, bootyBase) {
  return '0x40809acd' + decToBytes(spankAmount) + decToBytes(stakePeriods) + addrToBytes(delegateKey) + addrToBytes(bootyBase)
}

contract('SpankBank', (accounts) => {
  let snapshotId

  before('deploy contracts', async () => {
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    maxPeriods = parseInt(await spankbank.maxPeriods())

    multisig = await MultiSigWallet.deployed()

    owner = accounts[0]
  })

  // TODO test proper contract initialization here.

  describe.skip('Staking has nine requirements (counting logical AND requirements individually when possible).\n\t1. stake period greater than zero \n\t2. stake period less than or equal to maxPeriods \n\t3. stake greater than zero \n\t4. startingPeriod is zero \n\t5. endingPeriod is zero \n\t6. transfer complete \n\t7. delegateKey is not 0x0 \n\t8. bootyBase is not 0x0 \n\t9. delegateKey -> stakerAddress is 0x0\n', () => {

    const calcSpankPoints = (staker) => {
      return (staker.periods * 5) + 40
    }

    const verifyStake = async (staker) => {
      // current period
      const currentPeriod = +(await spankbank.currentPeriod())
      const nextPeriod = currentPeriod + 1

      // totalSpankStaked (assumes single staker)
      const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
      assert.equal(totalSpankStaked, staker.stake)

      // stakers[staker.address] -> Staker
      const bankedStaker = await spankbank.stakers(staker.address)
      const [spankStaked, startingPeriod, endingPeriod, delegateKey, bootyBase] = bankedStaker
      assert.equal(spankStaked, staker.stake)
      // staking during period 0 -> starting period = 1
      assert.equal(startingPeriod, nextPeriod)
      // staking during period 0 -> ending period = 12
      assert.equal(endingPeriod, currentPeriod + staker.periods)
      assert.equal(delegateKey, staker.delegateKey)
      assert.equal(bootyBase, staker.bootyBase)

      // staker spankpoints for next period
      const spankPoints = await spankbank.getSpankPoints.call(staker.address, nextPeriod)
      assert.equal(spankPoints, calcSpankPoints(staker))

      // total spankpoints for next period (assumes single staker)
      const [_, totalSpankPoints] = await spankbank.periods(nextPeriod)
      assert.equal(+totalSpankPoints, +spankPoints)

      // didClaimBooty default false - current period
      const didClaimBooty_current = await spankbank.getDidClaimBooty.call(staker.address, currentPeriod)
      assert.equal(didClaimBooty_current, false)

      // didClaimBooty default false - next period
      const didClaimBooty_next = await spankbank.getDidClaimBooty.call(staker.address, nextPeriod)
      assert.equal(didClaimBooty_next, false)

      // user SPANK decreased (assumes all SPANK is staked)
      const stakerSpankBalance = await spankToken.balanceOf(staker.address)
      assert.equal(+stakerSpankBalance, 0)

      // spankBank SPANK increased
      const spankbankSpankBalance = await spankToken.balanceOf(spankbank.address)
      assert.equal(+spankbankSpankBalance, staker.stake)

      // stakerByDelegateKey -> set
      const stakerAddress = await spankbank.getStakerFromDelegateKey(staker.delegateKey)
      assert.equal(stakerAddress, staker.address)
    }

    beforeEach(async () => {
      snapshotId = await snapshot()

      staker1 = {
        address : accounts[1],
        stake : 100,
        delegateKey : accounts[1],
        bootyBase : accounts[1],
        periods: 12
      }

      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
    })

    afterEach(async () => {
      await restore(snapshotId)
    })

    it('0.1 happy case - stake directly', async () => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})

      await verifyStake(staker1)
    })

    it('0.2 happy case - receive approval', async () => {
      const extraData = makeExtraData(staker1.periods, staker1.delegateKey, staker1.bootyBase)
      await spankToken.approveAndCall(spankbank.address, staker1.stake, extraData, {from: staker1.address})

      await verifyStake(staker1)
    })

    it('0.3 happy case - multisig stake', async () => {
      // TODO perhaps move all multisig tests to separate file

      const msKey1 = accounts[0]
      const msKey2 = accounts[1]

      const msStaker = {
        address : multisig.address,
        stake : 100,
        delegateKey : multisig.address,
        bootyBase : multisig.address,
        periods : 12
      }

      await spankToken.transfer(msStaker.address, msStaker.stake, {from: owner})

      await multisig.submitTransaction(spankToken.address, 0, multiSigApprove(spankbank.address, msStaker.stake), {from:msKey1})
      approveTx = await multisig.confirmTransaction(0, {from:msKey2})

      await multisig.submitTransaction(spankbank.address, 0, multiSigStake(msStaker.stake, msStaker.periods, msStaker.delegateKey, msStaker.bootyBase, {from : msKey1}))
      stakeTx = await multisig.confirmTransaction(1, {from:msKey2})

      await verifyStake(msStaker)
    })

    it('1. stake periods is zero', async () => {
      staker1.periods = 0

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith(SolRevert)
    })

    it('2. stake periods is greater than maxPeriods', async () => {
      staker1.periods = 13

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith(SolRevert)
    })

    it('3. stake amount is zero', async () => {
      staker1.stake = 0

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith(SolRevert)
    })

    it('4/5/(9). startingPeriod and EndingPeriod not zero (staker delegateKey exists)', async () => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith(SolRevert)

      // TODO test staking after moving forward periods?
    })

    it('6.1 transfer failure - insufficient balance', async () => {
      await spankToken.transfer(owner, 100, {from: staker1.address})

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith(SolRevert)
    })

    it('6.2 transfer failure - staker never approved', async () => {
      // TODO use constructor?
      staker2 = {
        address : accounts[2],
        stake : 100,
        delegateKey : accounts[2],
        bootyBase : accounts[2],
        periods: 12
      }

      await spankToken.transfer(staker2.address, 100, {from: owner})

      await spankbank.stake(staker2.stake, staker2.periods, staker2.delegateKey, staker2.bootyBase, {from : staker2.address}).should.be.rejectedWith(SolRevert)
    })

    it('7. staker delegate key is 0x0', async () => {
      staker1.delegateKey = "0x0000000000000000000000000000000000000000"

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith(SolRevert)
    })

    it('8. staker bootyBase is 0x0', async () => {
      staker1.bootyBase = "0x0000000000000000000000000000000000000000"

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith(SolRevert)
    })

    it('9. delegateKey has already been used', async () => {
      staker2 = {
        address : accounts[2],
        stake : 100,
        delegateKey : accounts[2],
        bootyBase : accounts[2],
        periods: 12
      }

      staker1.delegateKey = staker2.delegateKey

      await spankToken.transfer(staker2.address, 100, {from: owner})
      await spankToken.approve(spankbank.address, staker2.stake, {from: staker2.address})

      staker2Address = await spankbank.getStakerFromDelegateKey(staker2.delegateKey)

      // staker 2 successfully stakes
      await spankbank.stake(staker2.stake, staker2.periods, staker2.delegateKey, staker2.bootyBase, {from : staker2.address})

      // confirm staker2 delegateKey lookup -> staker2 address
      staker2Address = await spankbank.getStakerFromDelegateKey(staker2.delegateKey)
      assert.equal(staker2Address, staker2.address)

      // staker1 staking fails b/c delegateKey is pointing -> staker2
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith(SolRevert)
    })
  })

  describe('sending fees has two requirements\n\t1. BOOTY amount must be greater than zero\n\t2. transfer complete\n', () => {

    // Note: The initialBootySupply is minted and sent to the SpankBank owner
    // (whoever deployed it) during contract deployment.

    beforeEach(async () => {
      snapshotId = await snapshot()
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
    })

    afterEach(async () => {
      await restore(snapshotId)
    })

    it('0. happy case', async () => {
      await bootyToken.approve(spankbank.address, 1000, {from: owner})
      await spankbank.sendFees(1000, {from: owner})

      const totalBootySupply = await bootyToken.totalSupply.call()
      assert.equal(totalBootySupply, data.spankbank.initialBootySupply - 1000)

      const ownerBootyBalance = await bootyToken.balanceOf.call(owner)
      assert.equal(ownerBootyBalance, data.spankbank.initialBootySupply - 1000)

      // TODO will break if we move forward periods beforehand
      const [bootyFees] = await spankbank.periods(currentPeriod)
      assert.equal(+bootyFees, 1000)
    })

    it('1. sending zero amount', async () => {
      await bootyToken.approve(spankbank.address, 1000, {from: owner})
      await spankbank.sendFees(0, {from: owner}).should.be.rejectedWith(SolRevert)
    })

    it('2.1 transfer failure - insufficient balance', async () => {
      // first approve the booty transfer, but then send away all the booty
      await bootyToken.approve(spankbank.address, 1000, {from: owner})
      await bootyToken.transfer(accounts[1], data.spankbank.initialBootySupply, {from: owner})

      await spankbank.sendFees(1000, {from: owner}).should.be.rejectedWith(SolRevert)
    })

    it('2.2 transfer failure - sender didnt approve', async () => {
      await spankbank.sendFees(1000, {from: owner}).should.be.rejectedWith(SolRevert)
    })
  })
})
