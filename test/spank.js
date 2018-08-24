// TODO
// 1. test each value of spankpoints (stake for each possible period)
// 2. test staking with different delegateKey/bootyBase values
// 3. console logs arent happening - do I need to use promise based assertions?
// 4. not sure what tests should be done in separate msig file
// 5. some tests *need* to run in period 0, this can only be done after moving
//    forward if contracts are redeployed with the same startTime...?
// 6. test events are properly emitted
// 7. test spankBankIsOpen modifier

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

const e18 = 1000000000000000000 // 1e18

const data = require('../data.json')
const initialBootySupply = data.spankbank.initialBootySupply / e18 // should be 10,000

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
  // console.log('\t(moveForwardPeriods)')
  return true
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
    assert.equal(spankPoints, calcSpankPoints(staker.periods))

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

  const calcSpankPoints = (periods) => {
    return (periods * 5) + 40
  }

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

  describe.skip('sending fees has two requirements\n\t1. BOOTY amount must be greater than zero\n\t2. transfer complete\n', () => {

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
      await bootyToken.approve(spankbank.address, 1000 * e18, {from: owner})
      await spankbank.sendFees(1000 * e18, {from: owner})

      const totalBootySupply = +(await bootyToken.totalSupply.call()).dividedBy(e18)
      assert.equal(totalBootySupply, initialBootySupply - 1000)

      const ownerBootyBalance = +(await bootyToken.balanceOf.call(owner)).dividedBy(e18)
      assert.equal(ownerBootyBalance, initialBootySupply - 1000)

      // TODO will break if we move forward periods beforehand
      const [bootyFees] = await spankbank.periods(currentPeriod)
      assert.equal(+bootyFees.dividedBy(e18), 1000)
    })

    it('1. sending zero amount', async () => {
      await bootyToken.approve(spankbank.address, 1000 * e18, {from: owner})
      await spankbank.sendFees(0, {from: owner}).should.be.rejectedWith(SolRevert)
    })

    it('2.1 transfer failure - insufficient balance', async () => {
      // first approve the booty transfer, but then send away all the booty
      await bootyToken.approve(spankbank.address, 1000 * e18, {from: owner})
      await bootyToken.transfer(accounts[1], data.spankbank.initialBootySupply, {from: owner})

      await spankbank.sendFees(1000 * e18, {from: owner}).should.be.rejectedWith(SolRevert)
    })

    it('2.2 transfer failure - sender didnt approve', async () => {
      await spankbank.sendFees(1000 * e18, {from: owner}).should.be.rejectedWith(SolRevert)
    })
  })

  describe('minting BOOTY has two requirements\n\t1. current period is greater than 0\n\t2. mintingComplete is false for the period\n', () => {

    beforeEach(async () => {
      snapshotId = await snapshot()
      // TODO do I still need this current period updating?
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
    })

    afterEach(async () => {
      await restore(snapshotId)
    })

    // TODO this will fail if prior tests move forward periods, must be done in
    // period 0
    it('1. minting during period 0', async () => {
      await spankbank.mintBooty().should.be.rejectedWith(SolRevert)
    })

    it('0.1 happy case - above target supply -> no new booty', async () => {
      await moveForwardPeriods(1)
      await spankbank.mintBooty()
      const previousPeriod = +(await spankbank.currentPeriod()) - 1
      const [,,bootyMinted, mintingComplete] = await spankbank.periods(previousPeriod)
      assert.equal(+bootyMinted, 0)
      assert.equal(mintingComplete, true)

      const totalBootySupply = await bootyToken.totalSupply.call()
      assert.equal(+totalBootySupply, data.spankbank.initialBootySupply)

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(+spankbankBootyBalance, 0)
    })

    it('0.2 happy case - below target supply -> new booty minted', async () => {
      const fees = data.spankbank.initialBootySupply
      await bootyToken.approve(spankbank.address, fees, {from: owner})
      await spankbank.sendFees(fees, {from: owner})
      await moveForwardPeriods(1)
      await spankbank.mintBooty()
      const previousPeriod = +(await spankbank.currentPeriod()) - 1
      const [,,bootyMinted, mintingComplete] = await spankbank.periods(previousPeriod)
      assert.equal(+bootyMinted, fees * 20) // fees are burned, so we generate 20x
      assert.equal(mintingComplete, true)

      const totalBootySupply = await bootyToken.totalSupply.call()
      assert.equal(+totalBootySupply, fees * 20)

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(+spankbankBootyBalance, fees * 20)
    })

    it('2. minting already complete', async () => {
      await moveForwardPeriods(1)
      await spankbank.mintBooty()
      const previousPeriod = +(await spankbank.currentPeriod()) - 1
      const [,,bootyMinted, mintingComplete] = await spankbank.periods(previousPeriod)
      assert.equal(+bootyMinted, 0)
      assert.equal(mintingComplete, true)

      await spankbank.mintBooty().should.be.rejectedWith(SolRevert)
    })
  })

  describe('checking in has four requirements\n\t1. current period is less than the staker.endingPeriod\n\t2. updated ending period is greater than the staker ending period\n\t3. the updated ending period does not exceed max staking periods\n\t4. staker spankpoints for next period is zero\n', () => {

    // Note: if periods = 1, users can not checkIn, they must withdraw and re-stake

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
      currentPeriod = +(await spankbank.currentPeriod())
    })

    afterEach(async () => {
      await restore(snapshotId)
    })

    it('0.1 happy case - dont update endingPeriod', async () => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
      nextPeriod = currentPeriod + 1
      await spankbank.checkIn(0, {from: staker1.delegateKey})

      const bankedStaker = await spankbank.stakers(staker1.address)
      const [,, endingPeriod] = bankedStaker
      assert.equal(endingPeriod, currentPeriod + staker1.periods - 1)

      const spankPoints = await spankbank.getSpankPoints.call(staker1.address, nextPeriod)
      const periodsRemaining = endingPeriod - currentPeriod
      assert.equal(spankPoints, calcSpankPoints(periodsRemaining))

      const period = await spankbank.periods(nextPeriod)
      const [,totalSpankPoints] = period
      assert.equal(+totalSpankPoints, +spankPoints)
    })

    it('0.2 happy case - update endingPeriod', async () => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
      nextPeriod = currentPeriod + 1
      const bankedStaker_before = await spankbank.stakers(staker1.address)
      const [,, endingPeriod_before] = bankedStaker_before
      const updatedEndingPeriod = +endingPeriod_before + 1

      await spankbank.checkIn(updatedEndingPeriod, {from: staker1.delegateKey})

      const bankedStaker = await spankbank.stakers(staker1.address)
      const [,, endingPeriod] = bankedStaker
      assert.equal(endingPeriod, currentPeriod + staker1.periods)

      const spankPoints = await spankbank.getSpankPoints.call(staker1.address, nextPeriod)
      const periodsRemaining = endingPeriod - currentPeriod
      assert.equal(spankPoints, calcSpankPoints(periodsRemaining))

      const period = await spankbank.periods(nextPeriod)
      const [,totalSpankPoints] = period
      assert.equal(+totalSpankPoints, +spankPoints)
    })

    it('1.1 checkIn without staking fails', async () => {
      await spankbank.checkIn(0, {from: staker1.delegateKey}).should.be.rejectedWith(SolRevert)
    })

    it('1.2 checkIn with expired stake fails', async () => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await moveForwardPeriods(staker1.periods)
      await spankbank.updatePeriod()
      await spankbank.checkIn(0, {from: staker1.delegateKey}).should.be.rejectedWith(SolRevert)
    })

    it('2.1 updated ending period is equal to original ending period', async () => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      const bankedStaker = await spankbank.stakers(staker1.address)
      const [,, endingPeriod] = bankedStaker
      await spankbank.checkIn(+endingPeriod, {from: staker1.delegateKey}).should.be.rejectedWith(SolRevert)
    })

    it('2.2 updated ending period is less than original ending period', async () => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      const bankedStaker = await spankbank.stakers(staker1.address)
      const [,, endingPeriod] = bankedStaker
      await spankbank.checkIn(+endingPeriod - 1, {from: staker1.delegateKey}).should.be.rejectedWith(SolRevert)
    })

    it('3. updated ending period is beyond maximum staking limits', async () => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
      const updatedEndingPeriod = currentPeriod + data.spankbank.maxPeriods + 1
      await spankbank.checkIn(updatedEndingPeriod, {from: staker1.delegateKey}).should.be.rejectedWith(SolRevert)
    })

    it('4.1 checkIn during same period as stake fails', async() => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await spankbank.checkIn(0, {from: staker1.delegateKey}).should.be.rejectedWith(SolRevert)
    })

    it('4.2 checkIn twice in same period fails', async() => {
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      await spankbank.checkIn(0, {from: staker1.delegateKey})
      await spankbank.checkIn(0, {from: staker1.delegateKey}).should.be.rejectedWith(SolRevert)
    })
  })

  describe.only('claiming BOOTY has five requirements\n\t1. claiming period must be less than the current period\n\t2. staker spankpoints > 0 for period\n\t3. staker must not have claimed for claiming period\n\t4. minting of booty must have been completed for the claiming period\n\t5.transfer complete (not verified in tests)\n', () => {

    // TODO may want to test combinations... multiple stakers claim
    // - claiming period must be less than current period is redundant with
    //   requiring minting to be complete... minting will only ever be complete
    //   if we are at least 1 period ahead AND hit mint
    // - so remove the currentPeriod > claimPeriod requirement
    // - move mintingComplete requirement up

    beforeEach(async () => {
      snapshotId = await snapshot()

      staker1 = {
        address : accounts[1],
        stake : 100,
        delegateKey : accounts[1],
        bootyBase : accounts[1],
        periods: 12
      }

      const fees = data.spankbank.initialBootySupply

      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      // sending 100% of BOOTY as fees
      await moveForwardPeriods(1)
      await bootyToken.approve(spankbank.address, fees, {from: owner})
      await spankbank.sendFees(fees, {from: owner})
    })

    afterEach(async () => {
      await restore(snapshotId)
    })

    it('0. happy case - staker claims booty', async () => {
      await moveForwardPeriods(1)
      await spankbank.mintBooty()

      currentPeriod = +(await spankbank.currentPeriod())
      previousPeriod = currentPeriod - 1

      await spankbank.claimBooty(previousPeriod, { from: staker1.address })

      const didClaimBooty = await spankbank.getDidClaimBooty.call(staker1.address, previousPeriod)
      assert.ok(didClaimBooty)

      const stakerBootyBalance = await bootyToken.balanceOf.call(staker1.address)
      assert.equal(+stakerBootyBalance, data.spankbank.initialBootySupply * 20)

      const bankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(+bankBootyBalance, 0)
    })


    it.skip('1. claim period is not less than current period', async () => {
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

    it.skip('2. staker alraedy claimed booty for period', async () => {
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

    it.skip('3. did not mint for the period', async () => {
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

    it.skip('SUCCESS!', async () => {
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
