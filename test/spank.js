// 1. james - test specific require messages
// 2. msig - review other file
// 3. events - merge with wolever
const BN = require('bn.js')

const abi = require('web3-eth-abi')
const util = require('util');
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

const { decToBytes, addrToBytes } = require('./utils')

const e18 = new BN("1000000000000000000") // 1e18

const data = require('../data.json');
const initialBootySupply = data.spankbank.initialBootySupply / e18 // should be 10,000

const getBlock = util.promisify(web3.eth.getBlock.bind(web3))
const getTransaction = util.promisify(web3.eth.getTransaction.bind(web3))

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

// Note: this will move forward the timestamp but *not* the currentPeriod
// any write operation to the contract will implicitely call updatePeriod
// to get the period after moving forward, we call:
// await moveForwardPeriods(X)
// await spankbank.updatePeriod()
// const currentPeriod = await spankbank.currentPeriod.call()
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
  return true
}

function getEventParams(tx, event) {
  if (tx.logs.length > 0) {
    for (let idx=0; idx < tx.logs.length; idx++) {
      if (tx.logs[idx].event == event) {
        return tx.logs[idx].args
      }
    }
  }
  return false
}

async function constructorEvents(Contract) {
  const numPrevBlocks = 3
  const inputs = Contract.abi.find(item => item.type === 'constructor').inputs
  const latestBlock = await web3.eth.getBlock('latest')
  let payload = []
  for (let x = numPrevBlocks; x >= 0; x--) {
      let block = await web3.eth.getBlock(latestBlock.number - x)
      const receipt = await web3.eth.getTransactionReceipt(block.transactions[0])
      if (receipt.logs.length > 0) {
          payload = await receipt.logs.map( log => {
              if (log.address == spankbank.address) {
                  const topics = (log.topics.length > 1) ? log.topics.slice(1) : []
                  return abi.decodeLog(inputs, log.data, topics)
              }
          })
      }
  }

  const eventPayload = payload.filter(n => n)[0]
  assert.equal(eventPayload.spankAddress, spankToken.address)
  assert.equal(eventPayload.initialBootySupply, data.spankbank.initialBootySupply)
  assert.equal(eventPayload.bootyTokenName, data.booty.name)
  assert.equal(eventPayload.bootyDecimalUnits, data.booty.decimals)
  assert.equal(eventPayload.bootySymbol, data.booty.symbol)
}

function makeExtraData(staker) {
  sixtyFourZeros = "0000000000000000000000000000000000000000000000000000000000000000"
  periodLengthHex = staker.periods.toString(16)
  delegateKey = staker.delegateKey.split("0x")[1]
  bootyBase = staker.bootyBase.split("0x")[1]
  periodLengthData = String(sixtyFourZeros.substring(0,sixtyFourZeros.length - periodLengthHex.length)) + periodLengthHex
  return '0x0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000' + delegateKey + '000000000000000000000000' + bootyBase + periodLengthData
}

// TODO update function sigs 4-byte below and parameter appending

function multiSigApprove(_spender, _value) {
  return web3.eth.abi.encodeFunctionSignature('approve(address,uint256)') +
          web3.eth.abi.encodeParameters(['address', 'uint256'], [_spender, _value]).split("0x")[1]
}

function multiSigStake(spankAmount, stakePeriods, delegateKey, bootyBase) {
  return web3.eth.abi.encodeFunctionSignature('stake(uint256,uint256,address,address)') +
          web3.eth.abi.encodeParameters(['uint256', 'uint256', 'address', 'address'], [spankAmount, stakePeriods, delegateKey, bootyBase]).split("0x")[1]
}

function multiSigCheckIn(stakeIds, updatedEndingPeriods) {
  return web3.eth.abi.encodeFunctionSignature('checkIn(bytes32[],uint256[])') +
          web3.eth.abi.encodeParameters(['bytes32[]', 'uint256[]'], [stakeIds, updatedEndingPeriods]).split("0x")[1]
}

function multiSigClaimBooty(claimPeriods) {
  return web3.eth.abi.encodeFunctionSignature('claimBooty(uint256[])') +
          web3.eth.abi.encodeParameter('uint256[]', claimPeriods).split("0x")[1]
}

function multiSigSplitStake(stakeId, newAddress, newDelegateKey, newBootyBase, spankAmount) {
  return web3.eth.abi.encodeFunctionSignature('splitStake(bytes32,address,address,address,uint256)') +
          web3.eth.abi.encodeParameters(['bytes32', 'address', 'address', 'address', 'uint256'], [stakeId, newAddress, newDelegateKey, newBootyBase, spankAmount]).split("0x")[1]
}

function multiSigIncreaseStake(stakeId, spankAmount) {
  return web3.eth.abi.encodeFunctionSignature('increaseStake(bytes32,uint256)') +
          web3.eth.abi.encodeParameters(['bytes32', 'uint256'], [stakeId, spankAmount]).split("0x")[1]
}

function multiSigUpdateDelegateKey(newDelegateKey) {
  return web3.eth.abi.encodeFunctionSignature('updateDelegateKey(address)') +
          web3.eth.abi.encodeParameter('address', newDelegateKey).split("0x")[1]
}

function multiSigUpdateBootyBase(newBootyBase) {
  return web3.eth.abi.encodeFunctionSignature('updateBootyBase(address)') +
          web3.eth.abi.encodeParameter('address', newBootyBase).split("0x")[1]
}

function multiSigVoteToClose() {
  return web3.eth.abi.encodeFunctionSignature('voteToClose()')
}

function multiSigWithdrawStake(stakeIds) {
  return web3.eth.abi.encodeFunctionSignature('withdrawStake(bytes32[])') +
          web3.eth.abi.encodeParameter('bytes32[]', stakeIds).split("0x")[1]
}

contract('SpankBank', (accounts) => {
  let snapshotId

  // Verify functions used across test sets declared here

  // input is a single staker or an array of stakers (same for txs)
  const verifyStake = async (stakers, txs) => {
    stakers = stakers.length ? stakers : [stakers]
    // only test event params if txs supplied
    if (txs) {
      txs = txs.length ? txs : [txs]
    }

    const currentPeriod = +(await spankbank.currentPeriod())

    // verify staker-specific state transitions
    for (let [index, staker] of stakers.entries()) {

      // stakers[staker.address] -> Staker
      const bankedStaker = await spankbank.stakers(staker.address)
      const stakeIds = await spankbank.getStakeIds(staker.address)
      const stake = await spankbank.stakes(stakeIds[0]) // TODO we currently assume there is only one stake per staker as this was the test setup until now!
      const {totalSpank, delegateKey, bootyBase} = bankedStaker
      
      assert.equal(+totalSpank, staker.stake)
      // staking during period 0 -> starting period = 1
      assert.equal(+stake.startingPeriod, currentPeriod)
      // staking during period 0 -> ending period = 11
      assert.equal(+stake.endingPeriod, currentPeriod + staker.periods - 1)
      assert.equal(delegateKey, staker.delegateKey)
      assert.equal(bootyBase, staker.bootyBase)

      // staker spankpoints for current period
      const spankPoints = await spankbank.getSpankPoints.call(staker.address, currentPeriod)
      assert.equal(+spankPoints, calcSpankPoints(staker.periods, staker.stake))

      // didClaimBooty default false - current period
      const didClaimBooty_current = await spankbank.getDidClaimBooty.call(staker.address, currentPeriod)
      assert.equal(didClaimBooty_current, false)

      // user SPANK decreased (assumes all SPANK is staked)
      const stakerSpankBalance = await spankToken.balanceOf(staker.address)
      assert.equal(+stakerSpankBalance, 0)

      // stakerByDelegateKey -> set
      const stakerAddress = await spankbank.getStakerFromDelegateKey(staker.delegateKey)
      assert.equal(stakerAddress, staker.address)

      // only test event params if txs supplied
      if (txs) {
        const event = getEventParams(txs[index], 'StakeEvent')
        assert.equal(event.staker, staker.address)
        assert.equal(+event.period, currentPeriod)
        assert.equal(+event.spankPoints, +spankPoints)
        assert.equal(+event.spankAmount, staker.stake)
        assert.equal(+event.stakePeriods, staker.periods)
        assert.equal(event.delegateKey, staker.delegateKey)
        assert.equal(event.bootyBase, staker.bootyBase)
      }
    }

    // verify aggregate values
    const expectedTotalSpankStaked = stakers.reduce((total, staker) => {
      return total + staker.stake
    }, 0)

    const expectedTotalSpankPoints = stakers.reduce((total, staker) => {
      return total + calcSpankPoints(staker.periods, staker.stake)
    }, 0)

    const totalSpankStaked = await spankToken.balanceOf.call(spankbank.address)
    assert.equal(+totalSpankStaked, expectedTotalSpankStaked)

    // total spankpoints for current period
    const {totalSpankPoints} = await spankbank.periods(currentPeriod)
    assert.equal(+totalSpankPoints, expectedTotalSpankPoints)

    // spankBank SPANK increased
    const spankbankSpankBalance = await spankToken.balanceOf(spankbank.address)
    assert.equal(+spankbankSpankBalance, expectedTotalSpankStaked)
  }

  // assumes single staker receiving all minted booty
  const verifyClaimBooty = async (staker, fees, periods) => {

    for (let i = 0; i < periods.length; i++) {
      const didClaimBooty = await spankbank.getDidClaimBooty.call(staker.address, periods[i])
      assert.ok(didClaimBooty)
    }

    const stakerBootyBalance = await bootyToken.balanceOf.call(staker.bootyBase)
    assert.equal(+stakerBootyBalance, fees * 20)

    const bankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
    assert.equal(+bankBootyBalance, 0)
  }

  const verifyUpdateDelegateKey = async (staker, newDelegateKey) => {
    const bankedStaker = await spankbank.stakers(staker.address)
    assert.equal(bankedStaker.delegateKey, newDelegateKey)

    const stakerAddress = await spankbank.stakerByDelegateKey.call(newDelegateKey)
    assert.equal(stakerAddress, staker.address)

    const zeroAddress = await spankbank.stakerByDelegateKey.call(staker.delegateKey)
    assert.equal(zeroAddress, '0x0000000000000000000000000000000000000000')
  }

  const verifyUpdateBootyBase = async (staker, newBootyBase) => {
    const bankedStaker = await spankbank.stakers(staker.address)
    assert.equal(bankedStaker.bootyBase, newBootyBase)
  }

  const verifySplitStake = async (splitStakeId, staker1, staker2, splitAmount, totalSpankStaked) => {
      // by default, assumes staker1.stake is totalSpankStaked
      totalSpankStaked = totalSpankStaked ? totalSpankStaked : staker1.stake

      const bankedStaker2 = await spankbank.stakers(staker2.address)
      const staker2Stakes = await spankbank.getStakeIds(staker2.address)
      const newStakeId = staker2Stakes[staker2Stakes.length-1] // assumes staker2 has at least one stake as the result of the split
      const splitStake = await spankbank.stakes(splitStakeId)
      const newStake = await spankbank.stakes(newStakeId)

      // spankStaked should be added/subtracted properly
      assert.equal(+splitStake.spankStaked, staker1.stake - splitAmount)
      assert.equal(+newStake.spankStaked, splitAmount)

      // starting period should be same as staker1
      assert.equal(+splitStake.startingPeriod, +newStake.startingPeriod)

      // ending period should be same as staker1
      assert.equal(+splitStake.endingPeriod, +newStake.endingPeriod)

      // delegateKey and bootyBase are properly set
      assert.equal(bankedStaker2.delegateKey, staker2.delegateKey)
      assert.equal(bankedStaker2.bootyBase, staker2.bootyBase)

      // spankBank SPANK remains the same
      const spankbankSpankBalance = await spankToken.balanceOf(spankbank.address)
      assert.equal(+spankbankSpankBalance, totalSpankStaked)

      // stakerByDelegateKey -> set
      const stakerAddress2 = await spankbank.getStakerFromDelegateKey(staker2.delegateKey)
      assert.equal(stakerAddress2, staker2.address)
  }

    const verifyIncreaseStake = async (stakeId, stakerAddress, stakeBefore, totalSpankBefore, increaseAmount, tx) => {

      const increasedStake = await spankbank.stakes(stakeId)
      // spankStaked should be added/subtracted properly
      assert.equal(+increasedStake.spankStaked, stakeBefore + increaseAmount)

      // staker's totalSpank should have increased
      const staker = await spankbank.stakers(stakerAddress)
      assert.equal(+staker.totalSpank, staker1.stake + increaseAmount)

      // spankBank SPANK has increased
      const bankedSpankBalance = await spankToken.balanceOf(spankbank.address)
      assert.equal(+bankedSpankBalance, totalSpankBefore + increaseAmount)

      // split stake event
      if (tx) {
        const increasedStakeEventPayload = getEventParams(tx, "IncreaseStakeEvent")
        assert.equal(increasedStakeEventPayload.stakeId, stakeId)
        assert.equal(+increasedStakeEventPayload.staker, stakerAddress)
        assert.equal(+increasedStakeEventPayload.increaseAmount, increaseAmount)
        assert.equal(+increasedStakeEventPayload.newSpankStaked, increasedStake.spankStaked)
      }
    }

  const calcSpankPoints = (periods, stake) => {
    return (((periods * 5) + 40) * stake) / 100
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

  beforeEach(async () => {
    snapshotId = await snapshot()

    staker1 = {
      address : accounts[1],
      stake : 100,
      delegateKey : accounts[1],
      bootyBase : accounts[1],
      periods: 12
    }

    staker2 = {
      address : accounts[2],
      stake : 100,
      delegateKey : accounts[2],
      bootyBase : accounts[2],
      periods: 12
    }

    staker3 = {
      address : accounts[3],
      stake : 100,
      delegateKey : accounts[3],
      bootyBase : accounts[3],
      periods: 12
    }

    msStaker = {
      address : multisig.address,
      stake : 100,
      delegateKey : multisig.address,
      bootyBase : multisig.address,
      periods : 12,
      key1: accounts[0],
      key2: accounts[1]
    }

    // filter = web3.eth.filter({ address: spankbank.address, fromBlock: 0 })
  })

  afterEach(async () => {
    await restore(snapshotId)
  })

  describe('SpankBank contract deployment', () => {
    it('parameters are initialized correctly', async () => {
      const currentPeriod = +(await spankbank.currentPeriod.call())
      assert.equal(currentPeriod, 0)

      const periodLength = +(await spankbank.periodLength.call())
      assert.equal(periodLength, data.spankbank.periodLength)

      const maxPeriods = +(await spankbank.maxPeriods.call())
      assert.equal(maxPeriods, data.spankbank.maxPeriods)

      const SPANK_reference = await spankbank.spankToken.call()
      assert.equal(SPANK_reference, spankToken.address)

      const BOOTY_reference = await spankbank.bootyToken.call()
      assert.equal(BOOTY_reference, bootyToken.address)

      const totalBootySupply = +(await bootyToken.totalSupply.call()).div(e18)
      assert.equal(totalBootySupply, initialBootySupply)

      const ownerBootyBalance = +(await bootyToken.balanceOf.call(owner)).div(e18)
      assert.equal(ownerBootyBalance, initialBootySupply)

      let stakePeriods = 1
      while(stakePeriods <= data.spankbank.maxPeriods) {
        let points = +(await spankbank.pointsTable.call(stakePeriods))
        assert.equal(points, calcSpankPoints(stakePeriods, 100))
        stakePeriods++
      }
      await constructorEvents(SpankBank)
    })
  })

  describe('Staking has ten requirements (counting logical AND requirements individually when possible).\n\t' +
  '1. stake period greater than zero \n\t' +
  '2. stake period less than or equal to maxPeriods \n\t' +
  '3. stake greater than zero \n\t' +
  '4. startingPeriod is zero \n\t' +
  '5. transfer complete \n\t' +
  '6. delegateKey is not 0x0 \n\t' +
  '7. bootyBase is not 0x0 \n\t' +
  '8. delegateKey -> stakerAddress is 0x0\n\t' +
  '9. SpankBankIsOpen modifier\n\t' +
  '10. proper receiveApproval caller\n', () => {

    beforeEach(async () => {
      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
    })

    it('0.1 happy case - stake directly + event', async () => {
      const tx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await verifyStake(staker1, tx)
    })

    it('0.2 happy case - move forward before staking + event', async () => {
      await moveForwardPeriods(1)
      const tx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})

      await verifyStake(staker1, tx)
    })

    it('0.3 happy case - receive approval', async () => {
      const extraData = makeExtraData(staker1)
      const tx = await spankToken.approveAndCall(spankbank.address, staker1.stake, extraData, {from: staker1.address})

      await verifyStake(staker1)
    })

    it('0.4 happy case - multisig stake', async () => {
      await spankToken.transfer(msStaker.address, msStaker.stake, {from: owner})

      await multisig.submitTransaction(spankToken.address, 0, multiSigApprove(spankbank.address, msStaker.stake), {from:msStaker.key1})
      approveTx = await multisig.confirmTransaction(0, {from:msStaker.key2})

      await multisig.submitTransaction(spankbank.address, 0, multiSigStake(msStaker.stake, msStaker.periods, msStaker.delegateKey, msStaker.bootyBase, {from : msStaker.key1}))
      stakeTx = await multisig.confirmTransaction(1, {from:msStaker.key2})

      await verifyStake(msStaker)
    })

    it('0.5 happy case - different delegateKey/bootyBase', async () => {
      staker1.delegateKey = accounts[2]
      staker1.bootyBase = accounts[2]
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})

      await verifyStake(staker1)
    })

    it('0.6 happy case - two stakers + event', async () => {
      const tx1 = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})

      // must xfer SPANK to staker2 and approve
      await spankToken.transfer(staker2.address, staker2.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker2.stake, {from: staker2.address})

      const tx2 = await spankbank.stake(staker2.stake, staker2.periods, staker2.delegateKey, staker2.bootyBase, {from : staker2.address})

      await verifyStake([staker1, staker2], [tx1, tx2])
    })

    it('0.7 happy case - two stakers, both using receive approval', async () => {
      const extraData1 = makeExtraData(staker1)
      await spankToken.approveAndCall(spankbank.address, staker1.stake, extraData1, {from: staker1.address})

      // must xfer SPANK to staker2
      await spankToken.transfer(staker2.address, staker2.stake, {from: owner})

      const extraData2 = makeExtraData(staker2)
      await spankToken.approveAndCall(spankbank.address, staker2.stake, extraData2, {from: staker2.address})

      await verifyStake([staker1, staker2])
    })

    it('0.8 edge case - doStake fails when called from external account', async () => {
      try {
        // if *internal* is removed, doStake will succeed
        await spankbank.doStake(staker1.address, staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})

        await verifyStake(staker1)
        throw new Error('doStake succeeded')
      } catch (err) {
        assert.equal(err, 'TypeError: spankbank.doStake is not a function')
      }
    })

    it('0.9 edge case - _updateNextPeriodPoints fails when called from external account', async () => {
      try {
        const tx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
        const {stakeId} = getEventParams(tx, 'StakeEvent')

        await verifyStake(staker1)

        const originalPoints = calcSpankPoints(staker1.periods, staker1.stake)

        // we attempt to improperly update the spankpoints for a staker
        // this will also increment the totalSpankPoints
        staker1.periods = 2

        // if *internal* is removed, _applyStakeToCurrentPeriod will succeed
        await spankbank._applyStakeToCurrentPeriod(staker1.address, stakeId, staker1.periods, {from : staker1.address})

        // staker spankpoints for this period
        const spankPoints = await spankbank.getSpankPoints.call(staker1.address, currentPeriod)
        assert.equal(+spankPoints, calcSpankPoints(staker1.periods, staker1.stake))

        // total spankpoints for this period
        const [_, totalSpankPoints] = await spankbank.periods(currentPeriod) // TODO not sure if this is still testing the intended ...
        assert.equal(+totalSpankPoints, +spankPoints + originalPoints)

        throw new Error('_applyStakeToCurrentPeriod succeeded')
      } catch (err) {
        assert.equal(err, 'TypeError: spankbank._applyStakeToCurrentPeriod is not a function')
      }
    })

    it('1. stake periods is zero', async () => {
      staker1.periods = 0

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith('stake not between zero and maxPeriods')
    })

    it('2. stake periods is greater than maxPeriods', async () => {
      staker1.periods = 13

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith('stake not between zero and maxPeriods')
    })

    it('3. stake amount is zero', async () => {
      staker1.stake = 0

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith('stake is 0')
    })

    it('5.1 transfer failure - insufficient balance', async () => {
      await spankToken.transfer(owner, staker1.stake, {from: staker1.address})

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith(SolRevert)
    })

    it('5.2 transfer failure - staker never approved', async () => {
      await spankToken.transfer(staker2.address, staker2.stake, {from: owner})

      await spankbank.stake(staker2.stake, staker2.periods, staker2.delegateKey, staker2.bootyBase, {from : staker2.address}).should.be.rejectedWith(SolRevert)
    })

    it('6. staker delegate key is 0x0', async () => {
      staker1.delegateKey = "0x0000000000000000000000000000000000000000"

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith('delegateKey is zero')
    })

    it('7. staker bootyBase is 0x0', async () => {
      staker1.bootyBase = "0x0000000000000000000000000000000000000000"

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith('bootyBase is zero')
    })

    it('8. delegateKey has already been used', async () => {
      staker1.delegateKey = staker2.delegateKey

      await spankToken.transfer(staker2.address, staker2.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker2.stake, {from: staker2.address})

      staker2Address = await spankbank.getStakerFromDelegateKey(staker2.delegateKey)

      // staker 2 successfully stakes
      await spankbank.stake(staker2.stake, staker2.periods, staker2.delegateKey, staker2.bootyBase, {from : staker2.address})

      // confirm staker2 delegateKey lookup -> staker2 address
      staker2Address = await spankbank.getStakerFromDelegateKey(staker2.delegateKey)
      assert.equal(staker2Address, staker2.address)

      // staker1 staking fails b/c delegateKey is pointing -> staker2
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address}).should.be.rejectedWith('delegateKey already used')
    })

    it('9.1 SpankBankIsOpen modifier - cant stake if spankbank is closed', async () => {
      // same as 0.5 two stakers test but staker1 calls voteToClose

      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})

      await spankbank.voteToClose({from : staker1.address})

      // must xfer SPANK to staker2 and approve
      await spankToken.transfer(staker2.address, staker2.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker2.stake, {from: staker2.address})

      await spankbank.stake(staker2.stake, staker2.periods, staker2.delegateKey, staker2.bootyBase, {from : staker2.address}).should.be.rejectedWith(SolRevert)

      // only staker1 should have been able to stake
      await verifyStake([staker1])
    })

    it('9.2 SpankBankIsOpen modifier - receiveApproval staking fails', async () => {
      // same as 0.7 two stakers test but staker1 calls voteToClose

      const extraData1 = makeExtraData(staker1)
      await spankToken.approveAndCall(spankbank.address, staker1.stake, extraData1, {from: staker1.address})

      await spankbank.voteToClose({from : staker1.address})

      // must xfer SPANK to staker2
      await spankToken.transfer(staker2.address, staker2.stake, {from: owner})

      const extraData2 = makeExtraData(staker2)
      await spankToken.approveAndCall(spankbank.address, staker2.stake, extraData2, {from: staker2.address}).should.be.rejectedWith(SolRevert)

      // only staker1 should have been able to stake via receiveApproval
      await verifyStake([staker1])
    })

    it('10. receiveApproval with invalid caller', async () => {
      // If an external UI uses the approve->stake flow, someone else could
      // intercept the staking flow and call receiveApproval maliciously on
      // behalf of the staker. We prevent this by requiring that
      // receiveApproval can only be called by the SPANK ERC20 token contract
      const extraData1 = makeExtraData(staker1)
      await spankToken.approveAndCall(spankbank.address, staker1.stake, extraData1, {from: staker1.address})

      // must xfer SPANK to staker2 and aprove
      await spankToken.transfer(staker2.address, staker2.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker2.stake, {from: staker2.address})

      // maliciously update periods to 6
      staker2.periods = 6
      const extraData2 = makeExtraData(staker2)

      // attempt to stake on behalf of staker2 as staker3 by calling
      // receiveApproval directly
      await spankbank.receiveApproval(staker2.address, staker2.stake, spankToken.address, extraData2, {from: staker3.address}).should.be.rejectedWith('invalid receiveApproval caller')
    })
  })

  describe('Stake - spankpoints correctly calculated for all periods', () => {
    let periodCounter = 1

    while(periodCounter < data.spankbank.maxPeriods) {
      (function() {
        // required bc periodCounter updates, thisPeriod acts as in-scope cache
        let thisPeriod = periodCounter - 1
        describe('stake '+periodCounter+' periods', () => {
          it('spankpoints verified', async () => {
            staker1.periods = thisPeriod + 1
            await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
            await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
            const tx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
            await verifyStake(staker1, tx)
          })
        })
      })()
      periodCounter++
    }
  })

  describe('sending fees has three requirements\n\t' +
  '1. BOOTY amount must be greater than zero\n\t' +
  '2. transfer complete\n\t3. SpankBankIsOpen modifier\n', () => {

    // Note: The initialBootySupply is minted and sent to the SpankBank owner
    // (whoever deployed it) during contract deployment.

    beforeEach(async () => {
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
    })

    it('0. happy case', async () => {
      const bootyAmount = new BN("1000").mul(e18)
      await bootyToken.approve(spankbank.address, bootyAmount, {from: owner})
      const tx = await spankbank.sendFees(bootyAmount, {from: owner})
      const sendFeesEventPayload = getEventParams(tx, "SendFeesEvent")
      assert.equal(sendFeesEventPayload.sender, owner)
      assert.equal(+sendFeesEventPayload.bootyAmount, +bootyAmount)

      const totalBootySupply = +(await bootyToken.totalSupply.call()).div(e18)
      assert.equal(totalBootySupply, initialBootySupply - 1000)

      const ownerBootyBalance = +(await bootyToken.balanceOf.call(owner)).div(e18)
      assert.equal(ownerBootyBalance, initialBootySupply - 1000)

      const {bootyFees} = await spankbank.periods(currentPeriod)
      assert.equal(+bootyFees.div(e18), 1000)
    })

    it('1. sending zero amount', async () => {
      await bootyToken.approve(spankbank.address, new BN("1000").mul(e18), {from: owner})
      await spankbank.sendFees(0, {from: owner}).should.be.rejectedWith(SolRevert)
    })

    it('2.1 transfer failure - insufficient balance', async () => {
      // first approve the booty transfer, but then send away all the booty
      await bootyToken.approve(spankbank.address, new BN("1000").mul(e18), {from: owner})
      await bootyToken.transfer(accounts[1], data.spankbank.initialBootySupply, {from: owner})

      await spankbank.sendFees(new BN("1000").mul(e18), {from: owner}).should.be.rejectedWith(SolRevert)
    })

    it('2.2 transfer failure - sender didnt approve', async () => {
      await spankbank.sendFees(new BN("1000").mul(e18), {from: owner}).should.be.rejectedWith(SolRevert)
    })

    it('3. SpankBankIsOpen modifier - sendFees fails', async () => {
      // must setup staker, stake, and voteToClose in order to close spankbank
      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await verifyStake(staker1)

      await spankbank.voteToClose({from : staker1.address})

      await bootyToken.approve(spankbank.address, new BN("1000").mul(e18), {from: owner})
      await spankbank.sendFees(new BN("1000").mul(e18), {from: owner}).should.be.rejectedWith(SolRevert)
    })
  })

  describe('minting BOOTY has three requirements\n\t' +
  '1. current period is greater than 0\n\t' +
  '2. mintingComplete is false for the period\n\t' +
  '3. SpankBankIsOpen modifier\n', () => {

    beforeEach(async () => {
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
    })

    it('0.1 happy case - above target supply -> no new booty', async () => {
      await moveForwardPeriods(1)
      const tx = await spankbank.mintBooty()
      const previousPeriod = +(await spankbank.currentPeriod()) - 1
      const {bootyMinted, mintingComplete} = await spankbank.periods(previousPeriod)
      assert.equal(+bootyMinted, 0)
      assert.equal(mintingComplete, true)
      const mintBootyEventPayload = getEventParams(tx, "MintBootyEvent")
      assert.equal(mintBootyEventPayload, false)

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
      const tx = await spankbank.mintBooty()
      const previousPeriod = +(await spankbank.currentPeriod()) - 1
      const {bootyMinted, mintingComplete} = await spankbank.periods(previousPeriod)
      assert.equal(+bootyMinted, fees * 20) // fees are burned, so we generate 20x
      assert.equal(mintingComplete, true)

      const mintBootyEventPayload = getEventParams(tx, "MintBootyEvent")
      assert.equal(+mintBootyEventPayload.targetBootySupply, bootyMinted)
      assert.equal(+mintBootyEventPayload.totalBootySupply, 0)

      const totalBootySupply = await bootyToken.totalSupply.call()
      assert.equal(+totalBootySupply, fees * 20)

      const spankbankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(+spankbankBootyBalance, fees * 20)
    })

    it('1. minting during period 0', async () => {
      await spankbank.mintBooty().should.be.rejectedWith('current period is zero')
    })

    it('2. minting already complete', async () => {
      await moveForwardPeriods(1)
      await spankbank.mintBooty()
      const previousPeriod = +(await spankbank.currentPeriod()) - 1
      const {bootyMinted, mintingComplete} = await spankbank.periods(previousPeriod)
      assert.equal(+bootyMinted, 0)
      assert.equal(mintingComplete, true)

      await spankbank.mintBooty().should.be.rejectedWith('minting already complete')
    })

    it('3 SpankBankIsOpen modifier - mintBooty fails', async () => {
      // must setup staker, stake, and voteToClose in order to close spankbank
      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      await verifyStake(staker1)

      await spankbank.voteToClose({from : staker1.address})

      await moveForwardPeriods(1)
      await spankbank.mintBooty().should.be.rejectedWith(SolRevert)
    })
  })

  describe('checking in has six requirements\n\t' +
  '1. current period is less than the staker.endingPeriod\n\t' +
  '2. updated ending period is greater than the staker ending period\n\t' +
  '3. the updated ending period does not exceed max staking periods\n\t' +
  '4. staker spankpoints for next period is zero\n\t' +
  '5. SpankBankIsOpen modifier\n\t' +
  '6. stake.spankStaked > 0\n', () => {

    beforeEach(async () => {
      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      currentPeriod = +(await spankbank.currentPeriod())
    })

    it('0.1 happy case - dont update endingPeriod', async () => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
      const checkInTx = await spankbank.checkIn([stakeId], [0], {from: staker1.delegateKey})

      const stake = await spankbank.stakes(stakeId)
      assert.equal(+stake.lastAppliedToPeriod, currentPeriod)
      assert.equal(+stake.endingPeriod, (currentPeriod - 1) + staker1.periods - 1) // stake was started LAST period (currentPeriod - 1)

      const spankPoints = await spankbank.getSpankPoints.call(staker1.address, currentPeriod)
      const periodsRemaining = stake.endingPeriod - currentPeriod + 1
      assert.equal(+spankPoints, calcSpankPoints(periodsRemaining, staker1.stake))

      const period = await spankbank.periods(currentPeriod)
      assert.equal(+period.totalSpankPoints, +spankPoints)

      const checkInEventPayload = getEventParams(checkInTx, "CheckInEvent")
      assert.equal(checkInEventPayload.staker, staker1.address)
      assert.equal(checkInEventPayload.stakeId, stakeId)
      assert.equal(+checkInEventPayload.period, currentPeriod)
      assert.equal(+checkInEventPayload.spankPoints, +spankPoints)
      assert.equal(+checkInEventPayload.stakeEndingPeriod, +stake.endingPeriod)
    })

    it('0.2 happy case - update endingPeriod', async () => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())

      const stake_before = await spankbank.stakes(stakeId)

      const checkInTx = await spankbank.checkIn([stakeId], [+stake_before.endingPeriod + 1], {from: staker1.delegateKey})

      const stake = await spankbank.stakes(stakeId)
      assert.equal(+stake.lastAppliedToPeriod, currentPeriod)
      assert.equal(stake.endingPeriod, (currentPeriod - 1) + staker1.periods) // stake was started LAST period (currentPeriod - 1)

      const spankPoints = await spankbank.getSpankPoints.call(staker1.address, currentPeriod)
      const periodsRemaining = +stake.endingPeriod - currentPeriod + 1
      assert.equal(+spankPoints, calcSpankPoints(periodsRemaining, staker1.stake))

      const period = await spankbank.periods(currentPeriod)
      assert.equal(+period.totalSpankPoints, +spankPoints)

      const checkInEventPayload = getEventParams(checkInTx, "CheckInEvent")
      assert.equal(checkInEventPayload.staker, staker1.address)
      assert.equal(checkInEventPayload.stakeId, stakeId)
      assert.equal(+checkInEventPayload.period, currentPeriod)
      assert.equal(+checkInEventPayload.spankPoints, +spankPoints)
      assert.equal(+checkInEventPayload.stakeEndingPeriod, +stake.endingPeriod)

    })

    it('1. checkIn with expired stake fails', async () => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(staker1.periods)
      await spankbank.updatePeriod()
      await spankbank.checkIn([stakeId], [0], {from: staker1.delegateKey}).should.be.rejectedWith('stake is expired')
    })

    it('2.1 updated ending period is equal to original ending period', async () => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      const stake = await spankbank.stakes(stakeId)
      await spankbank.checkIn([stakeId], [+stake.endingPeriod], {from: staker1.delegateKey}).should.be.rejectedWith('updatedEndingPeriod less than or equal to stake endingPeriod')
    })

    it('2.2 updated ending period is less than original ending period', async () => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      const stake = await spankbank.stakes(stakeId)
      await spankbank.checkIn([stakeId], [+stake.endingPeriod - 1], {from: staker1.delegateKey}).should.be.rejectedWith('updatedEndingPeriod less than or equal to stake endingPeriod')
    })

    it('3. updated ending period is beyond maximum staking limits', async () => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
      const updatedEndingPeriod = currentPeriod + data.spankbank.maxPeriods + 1
      await spankbank.checkIn([stakeId], [updatedEndingPeriod], {from: staker1.delegateKey}).should.be.rejectedWith('updatedEndingPeriod greater than currentPeriod and maxPeriods')
    })

    it('4.1 checkIn during same period as stake fails', async() => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await spankbank.checkIn([stakeId], [0], {from: staker1.delegateKey}).should.be.rejectedWith('cannot check-in twice for the same stake and period')
    })

    it('4.2 checkIn twice in same period fails', async() => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      await spankbank.checkIn([stakeId], [0], {from: staker1.delegateKey})
      await spankbank.checkIn([stakeId], [0], {from: staker1.delegateKey}).should.be.rejectedWith('cannot check-in twice for the same stake and period')
    })

    it('5. SpankBankIsOpen modifier - checkIn fails', async () => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())

      // same as 0.1 happy case except staker1 calls voteToClose before checkIn
      await spankbank.voteToClose({from : staker1.address})

      await spankbank.checkIn([stakeId], [0], {from: staker1.delegateKey}).should.be.rejectedWith(SolRevert)
    })

    it('6.1 checkIn without staking fails', async () => {
      await spankbank.checkIn([web3.utils.fromAscii("bogusStakeXXX")], [0], {from: staker1.delegateKey}).should.be.rejectedWith('stake is zero')
    })

    it('6.2 checkIn fails - splitStake 100%', async () => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(1)
      await spankbank.splitStake(stakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, staker1.stake, {from: staker1.address})
      const stake = await spankbank.stakes(stakeId)
      assert.equal(+stake.spankStaked, 0)

      await spankbank.checkIn([stakeId], [0], {from: staker1.delegateKey}).should.be.rejectedWith('stake is zero')
    })

    it('6.3 checkIn fails - voteToClose -> withdraw', async () => {
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      const {stakeId} = getEventParams(stakeTx, 'StakeEvent')
      await moveForwardPeriods(1)
      await spankbank.voteToClose({ from: staker1.address })
      await spankbank.withdrawStake([stakeId], { from: staker1.address })
      const stake = await spankbank.stakes(stakeId)
      assert.equal(+stake.spankStaked, 0)

      await spankbank.checkIn([stakeId], [0], {from: staker1.delegateKey}).should.be.rejectedWith(SolRevert)
    })
  })

  describe('claiming BOOTY has four requirements\n\t' +
  '1. staker spankpoints > 0 for period\n\t' +
  '2. staker must not have claimed for claiming period\n\t' +
  '3. minting of booty must have been completed for the claiming period\n\t' +
  '4.transfer complete (not verified in tests)\n', () => {
    // assumes single staker receiving all minted booty
    const verifyClaimBooty = async (staker, fees, periods) => {

      for (let i = 0; i < periods.length; i++) {
        const didClaimBooty = await spankbank.getDidClaimBooty.call(staker.address, periods[i])
        assert.ok(didClaimBooty)
      }

      const stakerBootyBalance = await bootyToken.balanceOf.call(staker.bootyBase)
      assert.equal(+stakerBootyBalance, fees * 20)

      const bankBootyBalance = await bootyToken.balanceOf.call(spankbank.address)
      assert.equal(+bankBootyBalance, 0)
    }

    const verifyClaimBootyEvent = async (tx, staker, claimedPeriods) => {
      const claimBootyEventPayload = getEventParams(tx, "ClaimBootyEvent")
      const stakerBootyBalance = await bootyToken.balanceOf.call(staker.bootyBase)
      assert.equal(claimBootyEventPayload.staker, staker.address)
      assert.equal(+claimBootyEventPayload.claimedPeriods, claimedPeriods)
      assert.equal(+claimBootyEventPayload.bootyOwed, +stakerBootyBalance)
    }

    // sets up each test case to start with staker1 having staked, the initial booty supply sent as fees to the same period,
    // and then moving forward to the next period such that test function are in the position to call mintBooty
    // for the period the stake was created.
    beforeEach(async () => {
      // sending 100% of BOOTY as fees -> results in booty supply of 20x fees
      fees = data.spankbank.initialBootySupply

      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      stakeId = getEventParams(stakeTx, 'StakeEvent').stakeId
      await bootyToken.approve(spankbank.address, fees, {from: owner})
      await spankbank.sendFees(fees, {from: owner}) // fees are sent into period where user has staked (and therefore already has points)
      await moveForwardPeriods(1)
    })

    it('0.1 happy case - staker claims booty after 1 period wait time', async () => {
      await spankbank.mintBooty()

      previousPeriod = +(await spankbank.currentPeriod()) - 1

      const tx = await spankbank.claimBooty([previousPeriod], { from: staker1.address })
      await verifyClaimBootyEvent(tx, staker1, 1)
      await verifyClaimBooty(staker1, fees, [previousPeriod])
    })

    it('0.2 happy case - staker claims booty for 2 periods ago', async () => {
      await spankbank.mintBooty()

      // move forward an extra period
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()

      twoPeriodsAgo = +(await spankbank.currentPeriod()) - 2

      const tx = await spankbank.claimBooty([twoPeriodsAgo], { from: staker1.address })
      await verifyClaimBootyEvent(tx, staker1, 1)
      await verifyClaimBooty(staker1, fees, [twoPeriodsAgo])
    })

    it('0.3 happy case - staker claims booty from previous period after checking in on current period', async () => {
      // staker1 checks in before claiming booty for the previous period
      await spankbank.checkIn([stakeId], [0], {from: staker1.delegateKey})
      await spankbank.mintBooty()

      previousPeriod = +(await spankbank.currentPeriod()) - 1

      const tx = await spankbank.claimBooty([previousPeriod], { from: staker1.address })
      await verifyClaimBootyEvent(tx, staker1, 1)

      // staker1 sends fees (all the booty just received)
      // assumes bootyBase is the same as address
      await bootyToken.approve(spankbank.address, fees, {from: staker1.address})
      await spankbank.sendFees(fees, {from: staker1.address})

      await moveForwardPeriods(1)
      await spankbank.mintBooty()

      previousPeriod = +(await spankbank.currentPeriod()) - 1

      // claim amount should be equal to fees, because total should be 20x
      // 20x fees -> burn fees -> total is 19x fees -> 1x fees should be minted
      // final staker booty balance should still be 20x fees

      // TODO the following claimBooty call should revert, because the staker should have no points in the previousPeriod, never checked-in. So, why is it not throwing? Important: the test never had a check-in for that period and all
      // the booty verified below is from the first claimBooty call. However, this claimBooty should revert
      const previousPoints = await spankbank.getSpankPoints.call(staker1.address, previousPeriod)
      // console.log('DEBUG: prevPoints: '+previousPoints) // how the hell does the staker have 90 points here without checking in on the previous period

      await spankbank.claimBooty([previousPeriod], { from: staker1.address })
      await verifyClaimBooty(staker1, fees, [previousPeriod])
    })

    it('0.4 happy case - claimBooty after updating bootyBase', async () => {
      staker1.bootyBase = accounts[2]
      await spankbank.updateBootyBase(staker1.bootyBase, {from: staker1.address})
      await spankbank.mintBooty()

      previousPeriod = +(await spankbank.currentPeriod()) - 1

      const tx = await spankbank.claimBooty([previousPeriod], { from: staker1.address })
      await verifyClaimBootyEvent(tx, staker1, 1)
      await verifyClaimBooty(staker1, fees, [previousPeriod])
    })

    it('0.5 happy case - staker claims booty after stake expires', async () => {
      await spankbank.mintBooty()

      claimPeriod = +(await spankbank.currentPeriod()) - 1

      // move forward until staker is expired
      await moveForwardPeriods(staker1.periods)
      await spankbank.updatePeriod()

      currentPeriod = +(await spankbank.currentPeriod())

      const bankedStake1 = await spankbank.stakes(stakeId)
      assert.isAbove(currentPeriod, +bankedStake1.endingPeriod)

      const tx = await spankbank.claimBooty([claimPeriod], { from: staker1.address })
      await verifyClaimBootyEvent(tx, staker1, 1)
      await verifyClaimBooty(staker1, fees, [claimPeriod])
    })

    it('0.6 happy case - staker claims booty after withdrawing', async () => {
      await spankbank.mintBooty()

      claimPeriod = +(await spankbank.currentPeriod()) - 1

      // move forward until staker is expired, and withdraw
      await moveForwardPeriods(staker1.periods)
      await spankbank.withdrawStake([stakeId], {from: staker1.address})

      const bankedStake1 = await spankbank.stakes(stakeId)
      assert.equal(+bankedStake1.spankStaked, 0)

      const tx = await spankbank.claimBooty([claimPeriod], { from: staker1.address })
      await verifyClaimBootyEvent(tx, staker1, 1)
      await verifyClaimBooty(staker1, fees, [claimPeriod])
    })

    it('0.7 happy case - staker claims booty after spankbank is closed', async () => {
      await spankbank.mintBooty()

      claimPeriod = +(await spankbank.currentPeriod()) - 1

      await spankbank.voteToClose({from : staker1.address})

      const isClosed = await spankbank.isClosed.call()
      assert.ok(isClosed)

      const tx = await spankbank.claimBooty([claimPeriod], { from: staker1.address })
      await verifyClaimBootyEvent(tx, staker1, 1)
      await verifyClaimBooty(staker1, fees, [claimPeriod])
    })

    it('1.1 staker failed to check in, claimBooty should fail', async () => {
      // Same as previous test, but the staker does not check in

      await spankbank.mintBooty()

      previousPeriod = +(await spankbank.currentPeriod()) - 1

      await spankbank.claimBooty([previousPeriod], { from: staker1.address })

      // staker1 sends fees (all the booty just received)
      // assumes bootyBase is the same as address
      await bootyToken.approve(spankbank.address, fees, {from: staker1.address})
      await spankbank.sendFees(fees, {from: staker1.address})

      await moveForwardPeriods(1)
      await spankbank.mintBooty()

      previousPeriod = +(await spankbank.currentPeriod()) - 1

      await spankbank.claimBooty([previousPeriod], { from: staker1.address }).should.be.rejectedWith('staker has no points')
    })

    it('1.2 non-staker attempts to claimBooty should fail', async () => {
      await spankbank.mintBooty()

      previousPeriod = +(await spankbank.currentPeriod()) - 1

      await spankbank.claimBooty([previousPeriod], { from: staker2.address }).should.be.rejectedWith('staker has no points')
    })

    it('2. staker already claimed booty for period', async () => {
      await spankbank.mintBooty()

      previousPeriod = +(await spankbank.currentPeriod() - 1)

      await spankbank.claimBooty([previousPeriod], { from: staker1.address })
      await verifyClaimBooty(staker1, fees, [previousPeriod])

      await spankbank.claimBooty([previousPeriod], { from: staker1.address }).should.be.rejectedWith('staker already claimed')
    })

    it('3. did not mint for the period', async () => {
      // skipping minting
      await spankbank.updatePeriod()
      previousPeriod = +(await spankbank.currentPeriod()) - 1

      await spankbank.claimBooty([previousPeriod], { from: staker1.address }).should.be.rejectedWith('booty not minted')
    })
  })

  describe('splitStake has 8 requirements\n\t' +
  '1. the new staker address is not address(0)\n\t' +
  '2. the new delegateKey is not address(0)\n\t' +
  '3. the new bootyBase is not address(0)\n\t' +
  '4. the new delegateKey is not already in use\n\t' +
  '5. the stake amount to be split is greater than zero\n\t' +
  '6. the current period is less than the stakers ending period\n\t' +
  '7. the amount to be split is less than or equal to staker\'s stake\n\t' +
  '8. the stake was not yet applied to the current period (via checkIn or stake)', () => {

    const verifySplitStake = async (tx, splitStakeId, staker1, staker2, splitAmount, totalSpankStaked) => {
      // by default, assumes staker1.stake is totalSpankStaked
      totalSpankStaked = totalSpankStaked ? totalSpankStaked : staker1.stake

      const bankedStaker2 = await spankbank.stakers(staker2.address)
      const staker2Stakes = await spankbank.getStakeIds(staker2.address)
      const newStakeId = staker2Stakes[staker2Stakes.length-1] // assumes staker2 has at least one stake as the result of the split
      const splitStake = await spankbank.stakes(splitStakeId)
      const newStake = await spankbank.stakes(newStakeId)

      // spankStaked should be added/subtracted properly
      assert.equal(+splitStake.spankStaked, staker1.stake - splitAmount)
      assert.equal(+newStake.spankStaked, splitAmount)

      // starting period should be same as staker1
      assert.equal(+splitStake.startingPeriod, +newStake.startingPeriod)

      // ending period should be same as staker1
      assert.equal(+splitStake.endingPeriod, +newStake.endingPeriod)

      // delegateKey and bootyBase are properly set
      assert.equal(bankedStaker2.delegateKey, staker2.delegateKey)
      assert.equal(bankedStaker2.bootyBase, staker2.bootyBase)

      // spankBank SPANK remains the same
      const spankbankSpankBalance = await spankToken.balanceOf(spankbank.address)
      assert.equal(+spankbankSpankBalance, totalSpankStaked)

      // stakerByDelegateKey -> set
      const stakerAddress2 = await spankbank.getStakerFromDelegateKey(staker2.delegateKey)
      assert.equal(stakerAddress2, staker2.address)

      // split stake event
      const splitStakeEventPayload = getEventParams(tx, "SplitStakeEvent")
      assert.equal(splitStakeEventPayload.fromStakeId, splitStakeId)
      assert.equal(splitStakeEventPayload.toStakeId, newStakeId)
      assert.equal(splitStakeEventPayload.fromStaker, staker1.address)
      assert.equal(splitStakeEventPayload.toStaker, staker2.address)
      assert.equal(splitStakeEventPayload.newDelegateKey, staker2.delegateKey)
      assert.equal(splitStakeEventPayload.newBootyBase, staker2.bootyBase)
      assert.equal(+splitStakeEventPayload.spankAmount, splitAmount)
    }

    beforeEach(async () => {
      // we split the entire stake by default
      splitAmount = staker1.stake

      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      splitStakeId = getEventParams(stakeTx, 'StakeEvent').stakeId;
    })

    it('0.1 splitStake successful', async () => {
      await moveForwardPeriods(1)
      const tx = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx, splitStakeId, staker1, staker2, splitAmount)
    })

    it('0.2 splitStake successful - splitAmount is less than total', async () => {
      splitAmount = staker1.stake / 2
      await moveForwardPeriods(1)
      const tx = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx, splitStakeId, staker1, staker2, splitAmount)
    })

    it('0.3 splitStake successful - different delegateKey/bootyBase', async () => {
      staker2.delegateKey = accounts[3]
      staker2.bootyBase = accounts[3]
      await moveForwardPeriods(1)
      const tx = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx, splitStakeId, staker1, staker2, splitAmount)
    })

    it('0.4. splitStake success - can split during penultimate period', async () => {
      await moveForwardPeriods(staker1.periods - 1)
      const tx = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx, splitStakeId, staker1, staker2, splitAmount)
    })

    it('0.5 splitStake successful - two splitstakes from same address', async () => {
      const totalStakedSpank = staker1.stake
      splitAmount = staker1.stake / 2
      await moveForwardPeriods(1)
      const tx1 = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx1, splitStakeId, staker1, staker2, splitAmount)

      // verifySplitStake expects staker1.stake to reflect onchain staked spank
      const stake1 = await spankbank.stakes(splitStakeId)
      staker1.stake = +stake1.spankStaked

      const tx2 = await spankbank.splitStake(splitStakeId, staker3.address, staker3.delegateKey, staker3.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx2, splitStakeId, staker1, staker3, splitAmount, totalStakedSpank)
    })

    it('0.6 splitStake successful - chained splitStake', async () => {
      const totalStakedSpank = staker1.stake
      splitAmount = staker1.stake / 2
      await moveForwardPeriods(1)
      const tx1 = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx1, splitStakeId, staker1, staker2, splitAmount)

      // verifySplitStake expects staker2.stake (in that function context) to reflect onchain staked spank
      const staker2Stakes = await spankbank.getStakeIds(staker2.address)
      splitStakeId = staker2Stakes[staker2Stakes.length - 1] // this is the stake ID being split in the second run
      splitStake = await spankbank.stakes(splitStakeId)
      staker2.stake = +splitStake.spankStaked

      // split 100% of the spank split to staker2 in turn to staker3
      const tx2 = await spankbank.splitStake(splitStakeId, staker3.address, staker3.delegateKey, staker3.bootyBase, splitAmount, {from: staker2.address})
      await verifySplitStake(tx2, splitStakeId, staker2, staker3, splitAmount, totalStakedSpank)
    })

    it('0.7.2 edge case - checkIn after <100% splitStake works and points>0', async () => {
      splitAmount = staker1.stake / 2
      await moveForwardPeriods(1)
      const tx = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx, splitStakeId, staker1, staker2, splitAmount)
      await spankbank.checkIn([splitStakeId], [0], {from: staker1.delegateKey})
      currentPeriod = +(await spankbank.currentPeriod())
      const spankPoints = await spankbank.getSpankPoints.call(staker1.address, currentPeriod)
      assert.isAbove(+spankPoints, 0) // should still have 50% of the original stake and therefore eligible for points in the current period
    })

    it('0.8 splitStake successful - after spankbank is closed', async () => {
      await moveForwardPeriods(1)

      await spankbank.voteToClose({from : staker1.address})

      const isClosed = await spankbank.isClosed.call()
      assert.ok(isClosed)

      const tx = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx, splitStakeId, staker1, staker2, splitAmount)
    })

    it('0.9. splitStake success - staker at penultimate period', async () => {
      await moveForwardPeriods(staker1.periods - 1)
      const tx = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx, splitStakeId, staker1, staker2, splitAmount)
    })

    it('1. splitStake fails - new address is 0x0', async () => {
      staker2.address = "0x0000000000000000000000000000000000000000"
      await moveForwardPeriods(1)
      await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('newAddress is zero')
    })

    it('2. splitStake fails - new delegateKey is 0x0', async () => {
      staker2.delegateKey = "0x0000000000000000000000000000000000000000"
      await moveForwardPeriods(1)
      await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('delegateKey is zero')
    })

    it('3. splitStake fails - new bootyBase is 0x0', async () => {
      staker2.bootyBase = "0x0000000000000000000000000000000000000000"
      await moveForwardPeriods(1)
      await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('bootyBase is zero')
    })

    it('4. splitStake fails - new delegateKey is in use', async () => {
      staker2.delegateKey = staker1.delegateKey
      await moveForwardPeriods(1)
      await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('delegateKey already used')
    })

    it('5. splitStake fails - splitAmount must be greater than 0', async () => {
      splitAmount = 0
      await moveForwardPeriods(1)
      await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('spankAmount is zero')
    })

    it('6. splitStake fails - staker expired', async () => {
      await moveForwardPeriods(staker1.periods)
      await spankbank.updatePeriod()
      await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('stake is expired')
    })

    it('7.1 splitStake fails - splitAmount exceeds staked spank', async () => {
      splitAmount = staker1.stake + 1
      await moveForwardPeriods(1)
      await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('spankAmount greater than stake')
    })

    it('7.2 splitStake fails - after 100% splitStake', async () => {
      await moveForwardPeriods(1)
      const tx = await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      await verifySplitStake(tx, splitStakeId, staker1, staker2, splitAmount)

      await spankbank.splitStake(splitStakeId, staker3.address, staker3.delegateKey, staker3.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('stake is zero')
    })

    it('7.3 splitStake fails - after voteToClose withdrawal', async () => {
      await moveForwardPeriods(1)
      await spankbank.voteToClose({from : staker1.address})
      await spankbank.withdrawStake([splitStakeId], {from: staker1.address})
      splitStake = await spankbank.stakes(splitStakeId) // this is the stakeId that was just withdrawn
      assert.equal(+splitStake.spankStaked, 0)

      await spankbank.splitStake(splitStakeId, staker3.address, staker3.delegateKey, staker3.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith(SolRevert)
    })

    it('8.1 splitStake fails - stake already applied to current period (via stake)', async () => {
      // skip moving forward periods
      await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('stake already applied to current period')
    })

    it('8.2 splitStake fails - stake already applied to current period (via checkIn)', async () => {
      await moveForwardPeriods(1)
      await spankbank.checkIn([splitStakeId], [0], {from: staker1.delegateKey})
      currentPeriod = +(await spankbank.currentPeriod())
      const spankPoints = await spankbank.getSpankPoints.call(staker1.address, 1)
      assert.isAbove(+spankPoints, 0)
      await spankbank.splitStake(splitStakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address}).should.be.rejectedWith('stake already applied to current period')
    })
  })

  describe('increaseStake has 3 requirements\n\t' +
  '1. the increase is greater than zero\n\t' +
  '2. the msg.sender is the owner of the stake' +
  '3. the stake is not expired\n\t' +
  '4. the stake was not yet applied to the current period (via checkIn or stake)', () => {

    const verifyIncreaseStake = async (tx, stakeId, stakerAddress, stakeBefore, totalSpankBefore, increaseAmount) => {

      const increasedStake = await spankbank.stakes(stakeId)
      // spankStaked should be added/subtracted properly
      assert.equal(+increasedStake.spankStaked, stakeBefore + increaseAmount)

      // staker's totalSpank should have increased
      const staker = await spankbank.stakers(stakerAddress)
      assert.equal(+staker.totalSpank, staker1.stake + increaseAmount)

      // spankBank SPANK has increased
      const bankedSpankBalance = await spankToken.balanceOf(spankbank.address)
      assert.equal(+bankedSpankBalance, totalSpankBefore + increaseAmount)

      // split stake event
      const increasedStakeEventPayload = getEventParams(tx, "IncreaseStakeEvent")
      assert.equal(increasedStakeEventPayload.stakeId, stakeId)
      assert.equal(+increasedStakeEventPayload.staker, stakerAddress)
      assert.equal(+increasedStakeEventPayload.increaseAmount, increaseAmount)
      assert.equal(+increasedStakeEventPayload.newSpankStaked, increasedStake.spankStaked)
    }

    beforeEach(async () => {
      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      stakeId = getEventParams(stakeTx, 'StakeEvent').stakeId;
    })

    it('0.1 increaseStake successful - increase small amount', async () => {
      await moveForwardPeriods(1)
      // we increase the stake by 50% of its original amount
      const increaseAmount = staker1.stake / 2
      await spankToken.transfer(staker1.address, increaseAmount, {from: owner})
      await spankToken.approve(spankbank.address, increaseAmount, {from: staker1.address})
      const totalSpankBefore = await spankToken.balanceOf(spankbank.address)
      const tx = await spankbank.increaseStake(stakeId, increaseAmount, {from: staker1.address})
      await verifyIncreaseStake(tx, stakeId, staker1.address, staker1.stake, +totalSpankBefore, increaseAmount)
    })

    it('0.2 increaseStake successful - increase large amount', async () => {
      await moveForwardPeriods(1)
      // we increase the stake to 11x its original amount
      const increaseAmount = staker1.stake * 10
      await spankToken.transfer(staker1.address, increaseAmount, {from: owner})
      await spankToken.approve(spankbank.address, increaseAmount, {from: staker1.address})
      const totalSpankBefore = await spankToken.balanceOf(spankbank.address)
      const tx = await spankbank.increaseStake(stakeId, increaseAmount, {from: staker1.address})
      await verifyIncreaseStake(tx, stakeId, staker1.address, staker1.stake, +totalSpankBefore, increaseAmount)
    })

    it('1. increaseStake fails - no increase amount', async () => {
      await moveForwardPeriods(1)
      const increaseAmount = 0
      await spankbank.increaseStake(stakeId, increaseAmount, {from: staker1.address}).should.be.rejectedWith('increaseAmount is zero')
    })

    it('2. increaseStake fails - stake is expired', async () => {
      await moveForwardPeriods(staker1.periods)
      const increaseAmount = staker1.stake
      await spankbank.increaseStake(stakeId, increaseAmount, {from: staker1.address}).should.be.rejectedWith('stake is expired')
    })

    it('3. increaseStake fails - wrong stake owner', async () => {
      await moveForwardPeriods(staker1.stakePeriods)
      const increaseAmount = staker1.stake
      await spankbank.increaseStake(stakeId, increaseAmount, {from: staker2.address}).should.be.rejectedWith('stake has different owner')
    })

    it('3.1 increaseStake fails - stake already applied after check-in', async () => {
      await moveForwardPeriods(1)
      await spankbank.checkIn([stakeId], [0], {from: staker1.address})
      const stake = await spankbank.stakes(stakeId)
      assert.equal(+stake.lastAppliedToPeriod, currentPeriod)
      const increaseAmount = staker1.stake
      await spankbank.increaseStake(stakeId, increaseAmount, {from: staker1.address}).should.be.rejectedWith('stake already applied to current period')
    })

    it('3.2 increaseStake fails - stake already applied after from staking', async () => {
      // skip moveForwardPeriods() to remain in staking period
      const increaseAmount = staker1.stake
      await spankbank.increaseStake(stakeId, increaseAmount, {from: staker1.address}).should.be.rejectedWith('stake already applied to current period')
    })
  })

  describe('updating delegate key has three requirements\n\t' +
  '1. new delegate key address is not address(0)\n\t' +
  '2. delegate key is not already in use\n\t' +
  '3. staker has a valid delegate key to update\n', () => {

    const verifyUpdateDelegateKey = async (tx, staker, newDelegateKey) => {
      const bankedStaker = await spankbank.stakers(staker.address)
      assert.equal(bankedStaker.delegateKey, newDelegateKey)

      const stakerAddress = await spankbank.stakerByDelegateKey.call(newDelegateKey)
      assert.equal(stakerAddress, staker.address)

      const zeroAddress = await spankbank.stakerByDelegateKey.call(staker.delegateKey)
      assert.equal(zeroAddress, '0x0000000000000000000000000000000000000000')

      //update delegate key event
      const updateDelegateKeyEventPayload = getEventParams(tx, "UpdateDelegateKeyEvent")
      assert.equal(updateDelegateKeyEventPayload.staker, stakerAddress)
      assert.equal(updateDelegateKeyEventPayload.newDelegateKey, newDelegateKey)
    }

    beforeEach(async () => {
      newDelegateKey = accounts[2]
      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      const tx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      stakeId = getEventParams(tx, 'StakeEvent').stakeId;
    })

    it('0.1 successfully update delegateKey', async () => {
      const tx = await spankbank.updateDelegateKey(newDelegateKey, {from: staker1.address})
      await verifyUpdateDelegateKey(tx, staker1, newDelegateKey)
    })

    it('0.2 successfully update delegateKey - after spankbank closed', async () => {
      await spankbank.voteToClose({from : staker1.address})
      const isClosed = await spankbank.isClosed.call()
      assert.ok(isClosed)

      const tx = await spankbank.updateDelegateKey(newDelegateKey, {from: staker1.address})
      await verifyUpdateDelegateKey(tx, staker1, newDelegateKey)
    })

    it('0.3 successfully update delegateKey - after voteToClose -> withdraw', async () => {
      await spankbank.voteToClose({from : staker1.address})
      await spankbank.withdrawStake([stakeId], {from: staker1.address})
      const orgStake = await spankbank.stakes(stakeId)
      assert.equal(+orgStake.spankStaked, 0)

      const tx = await spankbank.updateDelegateKey(newDelegateKey, {from: staker1.address})
      await verifyUpdateDelegateKey(tx, staker1, newDelegateKey)
    })

    it('0.4 successfully update delegateKey - after expire -> withdraw', async () => {
      await moveForwardPeriods(staker1.periods + 1)
      await spankbank.withdrawStake([stakeId], {from: staker1.address})
      const orgStake = await spankbank.stakes(stakeId)
      assert.equal(+orgStake.spankStaked, 0)

      const tx = await spankbank.updateDelegateKey(newDelegateKey, {from: staker1.address})
      await verifyUpdateDelegateKey(tx, staker1, newDelegateKey)
    })

    it('0.5 successfully update delegateKey - after 100% splitStake', async () => {
      newDelegateKey = accounts[3] // using accounts[2] for splitStake
      await moveForwardPeriods(1)
      await spankbank.splitStake(stakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, staker1.stake, {from: staker1.address})
      const orgStake = await spankbank.stakes(stakeId)
      assert.equal(+orgStake.spankStaked, 0)

      const tx = await spankbank.updateDelegateKey(newDelegateKey, {from: staker1.address})
      await verifyUpdateDelegateKey(tx, staker1, newDelegateKey)
    })

    it('1. new delegate key address is not address(0)', async () => {
      newDelegateKey = '0x0000000000000000000000000000000000000000'
      await spankbank.updateDelegateKey(newDelegateKey, {from: staker1.address}).should.be.rejectedWith('delegateKey is zero')
    })

    it('2. delegate key is not already in use', async () => {
      newDelegateKey = staker1.delegateKey
      await spankbank.updateDelegateKey(newDelegateKey, {from: staker1.address}).should.be.rejectedWith('delegateKey already used')
    })

    it('3. non-stakers cant update delegate keys', async () => {
      await spankbank.updateDelegateKey(newDelegateKey, {from: staker2.address}).should.be.rejectedWith('staker does not exist')
    })
  })

  describe('updating booty base has one requirement\n\t' +
  '1. staker must have SPANK staked', () => {

    const verifyUpdateBootyBase = async (tx, staker, newBootyBase) => {
      const bankedStaker = await spankbank.stakers(staker.address)
      const updatedBootyBase = bankedStaker.bootyBase
      assert.equal(updatedBootyBase, newBootyBase)
      const updateBootyBaseEventPayload = getEventParams(tx, "UpdateBootyBaseEvent")
      assert.equal(updateBootyBaseEventPayload.staker, staker.address)
      assert.equal(updateBootyBaseEventPayload.newBootyBase, newBootyBase)
    }

    beforeEach(async () => {
      newBootyBase = accounts[2]

      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      const tx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      stakeId = getEventParams(tx, 'StakeEvent').stakeId;
    })

    it('0.1 successfully update bootyBase', async () => {
      const tx = await spankbank.updateBootyBase(newBootyBase, {from: staker1.address})
      await verifyUpdateBootyBase(tx, staker1, newBootyBase)
    })

    it('0.2 successfully update bootyBase - after spankbank closed', async () => {
      await spankbank.voteToClose({from : staker1.address})
      const isClosed = await spankbank.isClosed.call()
      assert.ok(isClosed)

      const tx = await spankbank.updateBootyBase(newBootyBase, {from: staker1.address})
      await verifyUpdateBootyBase(tx, staker1, newBootyBase)
    })

    it('0.3 successfully update bootyBase - after voteToClose -> withdraw', async () => {
      await spankbank.voteToClose({from : staker1.address})
      await spankbank.withdrawStake([stakeId], {from: staker1.address})
      const stake = await spankbank.stakes(stakeId)
      assert.equal(+stake.spankStaked, 0)

      const tx = await spankbank.updateBootyBase(newBootyBase, {from: staker1.address})
      await verifyUpdateBootyBase(tx, staker1, newBootyBase)
    })

    it('0.4 successfully update bootyBase - after expire -> withdraw', async () => {
      await moveForwardPeriods(staker1.periods + 1)
      await spankbank.withdrawStake([stakeId], {from: staker1.address})
      const stake = await spankbank.stakes(stakeId)
      assert.equal(+stake.spankStaked, 0)

      const tx = await spankbank.updateBootyBase(newBootyBase, {from: staker1.address})
      await verifyUpdateBootyBase(tx, staker1, newBootyBase)
    })

    it('0.5 successfully update bootyBase - after 100% splitStake', async () => {
      await moveForwardPeriods(1)
      await spankbank.splitStake(stakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, staker1.stake, {from: staker1.address})
      const stake = await spankbank.stakes(stakeId)
      assert.equal(+stake.spankStaked, 0)

      const tx = await spankbank.updateBootyBase(newBootyBase, {from: staker1.address})
      await verifyUpdateBootyBase(tx, staker1, newBootyBase)
    })

    // TODO unclear whether this test is meant to verify staker existence or whether the staker has an actual non-zero, active stake?
    it('1. must have stake to update booty base', async () => {
      const staker2 = {
        address: accounts[2]
      }

      await spankbank.updateBootyBase(newBootyBase, {from: staker2.address}).should.be.rejectedWith('staker does not exist')
    })
  })

  describe('voteToClose has four requires\n\t' +
  '1. staker spank is greater than zero\n\t' +
  '2. current period < ending period\n\t' +
  '3. staker has not already voted to close in current period\n\t' +
  '4. spankbank is not closed, \n', () => {

    const verifyVoteToCloseEvent = async (tx, staker, period) => {
      const voteToCloseEventPayload = getEventParams(tx, "VoteToCloseEvent")
      assert.equal(voteToCloseEventPayload.staker, staker.address)
      assert.equal(voteToCloseEventPayload.period, period)
    }

    beforeEach(async () => {
      // reducing this so if staker1 and staker2 are both staking, staker2 can
      // voteToClose without hitting the closingTrigger
      staker2.stake = 50

      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      const stake1Tx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      stake1Id = getEventParams(stake1Tx, 'StakeEvent').stakeId

      await spankToken.transfer(staker2.address, staker2.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker2.stake, {from: staker2.address})
      const stake2Tx = await spankbank.stake(staker2.stake, staker2.periods, staker2.delegateKey, staker2.bootyBase, {from : staker2.address})
      stake2Id = getEventParams(stake1Tx, 'StakeEvent').stakeId

      currentPeriod = +(await spankbank.currentPeriod())
    })

    it('0.1 voteToClose success - closingTrigger reached', async () => {
      const tx = await spankbank.voteToClose({from : staker1.address})
      await verifyVoteToCloseEvent(tx, staker1, currentPeriod)

      const periodData = await spankbank.periods(currentPeriod)
      const closingVotes = periodData[6]
      assert.equal(+closingVotes, staker1.stake)

      const votedToClose = await spankbank.getVote(staker1.address, currentPeriod)
      assert.equal(votedToClose, true)

      const isClosed = await spankbank.isClosed.call()
      assert.ok(isClosed)
    })

    it('0.2 voteToClose success - closingTrigger not reached', async () => {
      const tx = await spankbank.voteToClose({from : staker2.address})
      await verifyVoteToCloseEvent(tx, staker2, currentPeriod)

      const periodData = await spankbank.periods(currentPeriod)
      const closingVotes = periodData[6]
      assert.equal(+closingVotes, staker2.stake)

      const votedToClose = await spankbank.getVote(staker2.address, currentPeriod)
      assert.equal(votedToClose, true)

      const isClosed = await spankbank.isClosed.call()
      assert.notOk(isClosed)
    })

    it('0.3 voteToClose success - closing trigger after 2 votes', async () => {
      const tx1 = await spankbank.voteToClose({from : staker2.address})
      await verifyVoteToCloseEvent(tx1, staker2, currentPeriod)

      const tx2 = await spankbank.voteToClose({from : staker1.address})
      await verifyVoteToCloseEvent(tx2, staker1, currentPeriod)

      const periodData = await spankbank.periods(currentPeriod)
      const closingVotes = periodData[6]
      assert.equal(+closingVotes, staker1.stake + staker2.stake)

      const votedToClose1 = await spankbank.getVote(staker1.address, currentPeriod)
      assert.equal(votedToClose1, true)

      const votedToClose2 = await spankbank.getVote(staker2.address, currentPeriod)
      assert.equal(votedToClose2, true)

      const isClosed = await spankbank.isClosed.call()
      assert.ok(isClosed)
    })

    it('0.4. voteToClose success - penultimate period', async () => {
      await moveForwardPeriods(staker1.periods - 1)
      const tx = await spankbank.voteToClose({from : staker1.address})
      await verifyVoteToCloseEvent(tx, staker1, staker1.periods - 1)

      currentPeriod = +(await spankbank.currentPeriod())

      const periodData = await spankbank.periods(currentPeriod)
      const closingVotes = periodData[6]
      assert.equal(+closingVotes, staker1.stake)

      const votedToClose = await spankbank.getVote(staker1.address, currentPeriod)
      assert.equal(votedToClose, true)

      const isClosed = await spankbank.isClosed.call()
      assert.ok(isClosed)
    })

    it('1.1 voteToClose fails - staker spank is greater than zero - non-staker', async () => {
      await spankbank.voteToClose({from : staker3.address}).should.be.rejectedWith('staker has no Spank')
    })

    it('1.2 voteToClose fails - staker spank is greater than zero - splitStaked 100% of stake', async () => {
      await moveForwardPeriods(1)
      await spankbank.splitStake(stake1Id, staker3.address, staker3.delegateKey, staker3.bootyBase, staker1.stake, {from: staker1.address})

      const stake1 = await spankbank.stakes(stake1Id)
      assert.equal(+stake1.spankStaked, 0)

      await spankbank.voteToClose({from : staker1.address}).should.be.rejectedWith('staker has no Spank')
    })

    it('2. voteToClose fails - no active stakes', async () => {
      await moveForwardPeriods(staker1.periods)
      await spankbank.voteToClose({from : staker1.address}).should.be.rejectedWith('no active stakes')
    })

    it('3. voteToClose fails - staker already voted to close', async () => {
      await spankbank.voteToClose({from : staker1.address})
      await spankbank.voteToClose({from : staker1.address}).should.be.rejectedWith('stake already voted')
    })

    it('4. voteToClose fails - spankbank is closed', async () => {
      await spankbank.voteToClose({from : staker1.address})
      await spankbank.voteToClose({from : staker2.address}).should.be.rejectedWith('SpankBank already closed')
    })
  })

  describe('withdraw stake has two requirements\n\t' +
  '1. current period must be greater than staker ending period\n\t' +
  '2. staker.spankStaked > 0\n', () => {

    const verifyWithdrawEvent = async (tx, staker, amount) => {
      const verifyWithdrawEventPayload = getEventParams(tx, "WithdrawStakeEvent")
      assert.equal(verifyWithdrawEventPayload.staker, staker.address)
      assert.equal(+verifyWithdrawEventPayload.totalSpankToWithdraw, amount)
    }

    beforeEach(async () => {
      await spankToken.transfer(staker1.address, staker1.stake, {from: owner})
      await spankToken.approve(spankbank.address, staker1.stake, {from: staker1.address})
      const stakeTx = await spankbank.stake(staker1.stake, staker1.periods, staker1.delegateKey, staker1.bootyBase, {from : staker1.address})
      stakeId = getEventParams(stakeTx, 'StakeEvent').stakeId
    })

    it('0.1 withdrawStake success', async () => {
      await moveForwardPeriods(staker1.periods + 1)
      const tx = await spankbank.withdrawStake([stakeId], {from: staker1.address})
      await verifyWithdrawEvent(tx, staker1, staker1.stake)

      const stakerSpankBalance = +(await spankToken.balanceOf.call(staker1.address))
      assert.equal(stakerSpankBalance, staker1.stake)

      const stake1 = await spankbank.stakes(stakeId)
      assert.equal(+stake1.spankStaked, 0)

      const bankSpankBalance = +(await spankToken.balanceOf.call(spankbank.address))
      assert.equal(bankSpankBalance, 0)

      const totalSpankStaked = +(await spankbank.totalSpankStaked.call())
      assert.equal(totalSpankStaked, 0)
    })

    it('0.2 withdrawStake success - after spankbank closed', async () => {
      await spankbank.voteToClose({from : staker1.address})
      const tx = await spankbank.withdrawStake([stakeId], {from: staker1.address})
      await verifyWithdrawEvent(tx, staker1, staker1.stake)

      const stakerSpankBalance = +(await spankToken.balanceOf.call(staker1.address))
      assert.equal(stakerSpankBalance, staker1.stake)

      const stake1 = await spankbank.stakes(stakeId)
      assert.equal(+stake1.spankStaked, 0)

      const bankSpankBalance = +(await spankToken.balanceOf.call(spankbank.address))
      assert.equal(bankSpankBalance, 0)

      const totalSpankStaked = +(await spankbank.totalSpankStaked.call())
      assert.equal(totalSpankStaked, 0)
    })

    it('0.3 withdrawStake success - after splitstake < 100%', async () => {
      const splitAmount = staker1.stake / 2
      await moveForwardPeriods(1)

      // split 50% of stake
      const splitTx = await spankbank.splitStake(stakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount, {from: staker1.address})
      splitStakeId = getEventParams(splitTx, 'SplitStakeEvent').toStakeId

      await moveForwardPeriods(staker1.periods)

      const tx1 = await spankbank.withdrawStake([stakeId], {from: staker1.address})
      await verifyWithdrawEvent(tx1, staker1, splitAmount)

      const tx2 = await spankbank.withdrawStake([splitStakeId], {from: staker2.address})
      await verifyWithdrawEvent(tx2, staker2, splitAmount)

      // staker1 should have received splitAmount (b/c splitAmount = 50% of stake)
      const staker1_SpankBalance = +(await spankToken.balanceOf.call(staker1.address))
      assert.equal(staker1_SpankBalance, splitAmount)

      // staker2 should also have splitAmount
      const staker2_SpankBalance = +(await spankToken.balanceOf.call(staker2.address))
      assert.equal(staker2_SpankBalance, splitAmount)

      // spankStaked for both should be 0
      const spankStake1 = await spankbank.stakes(stakeId)
      assert.equal(+spankStake1.spankStaked, 0)
      const spankStake2 = await spankbank.stakes(splitStakeId)
      assert.equal(+spankStake2.spankStaked, 0)

      const bankSpankBalance = +(await spankToken.balanceOf.call(spankbank.address))
      assert.equal(bankSpankBalance, 0)

      const totalSpankStaked = +(await spankbank.totalSpankStaked.call())
      assert.equal(totalSpankStaked, 0)
    })

    it('1. withdrawStake fail - stake not yet eligible for withdrawal', async () => {
      await moveForwardPeriods(staker1.periods)
      await spankbank.withdrawStake([stakeId], {from: staker1.address}).should.be.rejectedWith('currentPeriod less than waiting period or spankbank not closed')
      await moveForwardPeriods(1)
      const tx = await spankbank.withdrawStake([stakeId], {from: staker1.address})
      await verifyWithdrawEvent(tx, staker1, staker1.stake)
    })

    it('2.1 withdrawStake fail - after 100% splitstake', async () => {
      await moveForwardPeriods(1)

      // split 100% of stake
      await spankbank.splitStake(stakeId, staker2.address, staker2.delegateKey, staker2.bootyBase, staker1.stake, {from: staker1.address})

      await moveForwardPeriods(staker1.periods)

      await spankbank.withdrawStake([stakeId], {from: staker1.address}).should.be.rejectedWith('stake is zero')
    })

    it('2.2 withdrawStake fail - after expired -> withdrawal', async () => {
      await moveForwardPeriods(staker1.periods + 1)
      await spankbank.withdrawStake([stakeId], {from: staker1.address})
      // spankStaked should be 0
      const spankStake1 = await spankbank.stakes(stakeId)
      assert.equal(+spankStake1.spankStaked, 0)

      await spankbank.withdrawStake([stakeId], {from: staker1.address}).should.be.rejectedWith('stake is zero')
    })

    it('2.3 withdrawStake fail - after voteToClose -> withdrawal', async () => {
      await moveForwardPeriods(1)
      await spankbank.voteToClose({ from: staker1.address })
      await spankbank.withdrawStake([stakeId], {from: staker1.address})
      // spankStaked should be 0
      const spankStake1 = await spankbank.stakes(stakeId)
      assert.equal(+spankStake1.spankStaked, 0)

      await spankbank.withdrawStake([stakeId], {from: staker1.address}).should.be.rejectedWith('stake is zero')
    })
  })

  describe('multisig happy path tests', () => {
    beforeEach(async () => {
      await spankToken.transfer(msStaker.address, msStaker.stake, {from: owner})

      // approve
      await multisig.submitTransaction(spankToken.address, 0, multiSigApprove(spankbank.address, msStaker.stake), {from:msStaker.key1})
      await multisig.confirmTransaction(0, {from:msStaker.key2})

      // stake
      await multisig.submitTransaction(spankbank.address, 0, multiSigStake(msStaker.stake, msStaker.periods, msStaker.delegateKey, msStaker.bootyBase, {from : msStaker.key1}))
      await multisig.confirmTransaction(1, {from:msStaker.key2})
    })

    it('checkIn', async () => {
      await moveForwardPeriods(1)
      await spankbank.updatePeriod()
      currentPeriod = +(await spankbank.currentPeriod())
      nextPeriod = currentPeriod + 1

      const stakeIds = await spankbank.getStakeIds(msStaker.address)
      assert.equal(stakeIds.length, 1)

      await multisig.submitTransaction(spankbank.address, 0, multiSigCheckIn(stakeIds,[0]), {from:msStaker.key1})
      await multisig.confirmTransaction(2, {from:msStaker.key2})

      const stake = await spankbank.stakes(stakeIds[0])
      assert.equal(+stake.endingPeriod, currentPeriod + msStaker.periods - 2)

      const spankPoints = await spankbank.getSpankPoints.call(msStaker.address, currentPeriod)
      const periodsRemaining = stake.endingPeriod - currentPeriod + 1
      assert.equal(+spankPoints, calcSpankPoints(periodsRemaining, staker1.stake))

      const period = await spankbank.periods(currentPeriod)
      assert.equal(+period.totalSpankPoints, +spankPoints)
    })

    it('claimBooty', async () => {
      fees = data.spankbank.initialBootySupply
      await bootyToken.approve(spankbank.address, fees, {from: owner})
      await spankbank.sendFees(fees, {from: owner})

      await moveForwardPeriods(1)
      await spankbank.mintBooty()

      previousPeriod = +(await spankbank.currentPeriod()) - 1

      await multisig.submitTransaction(spankbank.address, 0, multiSigClaimBooty([previousPeriod]), {from:msStaker.key1})
      await multisig.confirmTransaction(2, {from:msStaker.key2})
      await verifyClaimBooty(msStaker, fees, [previousPeriod])
    })

    it('updateDelegateKey', async () => {
      const newDelegateKey = accounts[2]
      await multisig.submitTransaction(spankbank.address, 0, multiSigUpdateDelegateKey(newDelegateKey), {from:msStaker.key1})
      await multisig.confirmTransaction(2, {from:msStaker.key2})
      await verifyUpdateDelegateKey(msStaker, newDelegateKey)
    })

    it('updateBootyBase', async () => {
      const newBootyBase = accounts[2]
      await multisig.submitTransaction(spankbank.address, 0, multiSigUpdateBootyBase(newBootyBase), {from:msStaker.key1})
      await multisig.confirmTransaction(2, {from:msStaker.key2})
      await verifyUpdateBootyBase(msStaker, newBootyBase)
    })

    it('splitStake', async () => {
      const splitAmount = msStaker.stake
      const stakeIds = await spankbank.getStakeIds(msStaker.address)
      assert.equal(stakeIds.length, 1)
      await moveForwardPeriods(1)
      await multisig.submitTransaction(spankbank.address, 0, multiSigSplitStake(stakeIds[0], staker2.address, staker2.delegateKey, staker2.bootyBase, splitAmount), {from: msStaker.key1})
      await multisig.confirmTransaction(2, {from:msStaker.key2})
      await verifySplitStake(stakeIds[0], msStaker, staker2, splitAmount)
    })

    it('increaseStake', async () => {
      const increaseAmount = msStaker.stake * 2
      const totalSpankBefore = await spankToken.balanceOf(spankbank.address)
      const stakeIds = await spankbank.getStakeIds(msStaker.address)
      assert.equal(stakeIds.length, 1)
      await moveForwardPeriods(1)
      // wire the money
      await spankToken.transfer(msStaker.address, increaseAmount, {from: owner})
      await multisig.submitTransaction(spankToken.address, 0, multiSigApprove(spankbank.address, increaseAmount), {from:msStaker.key1})
      await multisig.confirmTransaction(2, {from:msStaker.key2})
      // increase stake
      await multisig.submitTransaction(spankbank.address, 0, multiSigIncreaseStake(stakeIds[0], increaseAmount), {from: msStaker.key1})
      await multisig.confirmTransaction(3, {from:msStaker.key2})
      await verifyIncreaseStake(stakeIds[0], msStaker.address, msStaker.stake, +totalSpankBefore, increaseAmount)
    })

    it('voteToClose', async () => {
      currentPeriod = +(await spankbank.currentPeriod())

      await multisig.submitTransaction(spankbank.address, 0, multiSigVoteToClose(), {from: msStaker.key1})
      await multisig.confirmTransaction(2, {from:msStaker.key2})

      const periodData = await spankbank.periods(currentPeriod)
      const closingVotes = periodData[6]
      assert.equal(+closingVotes, msStaker.stake)

      const votedToClose = await spankbank.getVote(msStaker.address, currentPeriod)
      assert.equal(votedToClose, true)

      const isClosed = await spankbank.isClosed.call()
      assert.ok(isClosed)
    })

    it('withdrawStake', async () => {
      await moveForwardPeriods(msStaker.periods + 1)

      const stakeIds = await spankbank.getStakeIds(msStaker.address)
      assert.equal(stakeIds.length, 1)
      await multisig.submitTransaction(spankbank.address, 0, multiSigWithdrawStake(stakeIds), {from: msStaker.key1})
      await multisig.confirmTransaction(2, {from:msStaker.key2})

      const stakerSpankBalance = +(await spankToken.balanceOf.call(msStaker.address))
      assert.equal(stakerSpankBalance, msStaker.stake)

      const spankmsStake = await spankbank.stakes(stakeIds[0])
      assert.equal(+spankmsStake.spankStaked, 0)

      const bankSpankBalance = +(await spankToken.balanceOf.call(spankbank.address))
      assert.equal(bankSpankBalance, 0)

      const totalSpankStaked = +(await spankbank.totalSpankStaked.call())
      assert.equal(totalSpankStaked, 0)
    })
  })
})
