// TODO
// 1. test each value of spankpoints
// 2. test staking with different delegateKey/bootyBase values
// 3. console logs arent happening - do I need to use promise based assertions?

// const {injectInTruffle} = require(`sol-trace`)
// injectInTruffle(web3, artifacts);
const HttpProvider = require(`ethjs-provider-http`)
const EthRPC = require(`ethjs-rpc`)
const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'))

const BigNumber = web3.BigNumber

// TODO remove should?
// const should = require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should()
const SolRevert = 'VM Exception while processing transaction: revert'

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintAndBurnToken')
const SpankBank = artifacts.require('./SpankBank')

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

contract('SpankBank', (accounts) => {
  before('deploy contracts', async () => {
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
    maxPeriods = parseInt(await spankbank.maxPeriods())

    owner = accounts[0]
  })

  // TODO test proper contract initialization here.

  // TODO this is a superstitious way of testing - each test is repeated to
  // ensure the only thing different about that particular test case is the
  // failing condition. The better way to do this is to do all setup inside
  // a beforeEach, make sure the initial test passes, and then *only* change
  // what is necessary inside each test. This removes a lot of the extra
  // clutter and confusion, allowing the reader to focus.

  describe('Staking has nine requirements (counting logical AND requirements individually when possible).\n\t1. stake period greater than zero \n\t2. stake period less than or equal to maxPeriods \n\t3. stake greater than zero \n\t4. startingPeriod is zero \n\t5. endingPeriod is zero \n\t6. transfer complete \n\t7. delegateKey is not 0x0 \n\t8. bootyBase is not 0x0 \n\t9. delegateKey -> stakerAddress is 0x0\n', () => {

    let snapshotId

    beforeEach(async () => {
      console.log('Before Each')
      snapshotId = await snapshot()

      staker1 = {
        address : accounts[1],
        stake : 100,
        delegateKey : accounts[1],
        bootyBase : accounts[1],
        periods: 12
      }

      await spankToken.transfer(staker1.address, 100, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
    })

    afterEach(async () => {
      console.log('After Each')
      await restore(snapshotId)
    })

    it('1. Happy Case', async () => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})

      // currentPeriod is the same
      const currentPeriod = parseInt(await spankbank.currentPeriod())
      assert.equal(currentPeriod, 0)

      // totalSpankStaked
      const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
      assert.equal(totalSpankStaked, 100)

      // stakers[staker.address] -> Staker
      const bankedStaker = await spankbank.stakers(staker1.address)
      const [spankStaked, startingPeriod, endingPeriod, delegateKey, bootyBase] = bankedStaker
      assert.equal(spankStaked, 100)
      assert.equal(startingPeriod, 1)
      assert.equal(endingPeriod, 12)
      assert.equal(delegateKey, staker1.delegateKey)
      assert.equal(bootyBase, staker1.bootyBase)

      // staker spankpoints
      const spankPoints = await spankbank.getSpankPoints.call(staker1.address, 1)
      assert.equal(spankPoints, 100)

      // total spankpoints
      const [_, totalSpankPoints] = await spankbank.periods(1)
      assert.equal(totalSpankPoints, 100)

      // didClaimBooty default false - period 0
      const didClaimBooty_0 = await spankbank.getDidClaimBooty.call(staker1.address, 0)
      assert.equal(didClaimBooty_0, false)

      // didClaimBooty default false - period 1
      const didClaimBooty_1 = await spankbank.getDidClaimBooty.call(staker1.address, 1)
      assert.equal(didClaimBooty_1, false)

      // user SPANK decreased
      const stakerSpankBalance = await spankToken.balanceOf(staker1.address)
      assert.equal(+stakerSpankBalance, 0)

      // spankBank SPANK increased
      const spankbankSpankBalance = await spankToken.balanceOf(spankbank.address)
      assert.equal(+spankbankSpankBalance, 100)

      // stakerByDelegateKey -> set
      const stakerAddress = await spankbank.getStakerFromDelegateKey(staker1.delegateKey)
      assert.equal(stakerAddress, staker1.address)
    })

    it('2. testing snapshot/restore', async () => {
      // totalSpankStaked
      const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
      assert.equal(+totalSpankStaked, 0)
    })

    it.skip('1. stake periods is zero', async () => {
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

    it.skip('2. stake periods is greater than maxPeriods', async () => {
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

    it.skip('3. stake amount is zero', async () => {
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

  })
})




