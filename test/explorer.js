const HttpProvider = require(`ethjs-provider-http`)
const EthRPC = require(`ethjs-rpc`)
const data = require('../data.json')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintAndBurnToken')
const SpankBank = artifacts.require('./SpankBank')

const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'))

/* convenience functions */
async function restore() {
  await ethRPC.sendAsync({method: `evm_revert`, id:0}, (err)=> {});
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
  return true
}

async function getStaker(address) {
  resp = await spankBank.stakers(address)
  return {address : address, stake : resp[0], startingPeriod : resp[1], endingPeriod : resp[2], delegateKey : resp[3], bootyBase: resp[4] }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/* test all happy cases */
contract('SpankBank::integration', (accounts) => {
  before('deploy', async () => {
    await restore()
    spankBank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankBank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)

    staker = {
      address : accounts[0],
      stake : 100,
      delegateKey : accounts[0],
      bootyBase : accounts[0],
      periods : 12
    }

    await spankToken.approve(spankBank.address, staker.stake, {from: staker.address})
    await bootyToken.approve(spankBank.address, 1, { from: staker.address })
  })

  describe('All SpankBank Events, Happy Case', () => {
    it('Stake', async () => {
      await spankBank.stake(staker.stake, staker.periods, staker.delegateKey, staker.bootyBase, { from: staker.address })
      await wait(2000)
    })
    it('Send Fees', async () => {
      await spankBank.sendFees(1, { from: staker.address })
      await wait(2000)
    })
    it('Split Stake', async () => {
      await moveForwardPeriods(1)
      await spankBank.updatePeriod()

      newStaker = {
        address: accounts[1]
      }

      await spankBank.splitStake(newStaker.address, newStaker.address, newStaker.address, staker.stake/2, { from: staker.address })
      await wait(2000)
    })
    it('Check In', async () => {
      checkInStaker = await getStaker(staker.address)
      checkInPeriod = parseInt(checkInStaker.endingPeriod) + 1
      await spankBank.checkIn(checkInPeriod, { from: staker.address })
      await wait(2000)
    })
    it('Mint Booty', async () => {
      await spankBank.mintBooty()
      await wait(2000)
    })
    it('Claim Booty', async () => {
      currentPeriod = await spankBank.currentPeriod()
      await spankBank.claimBooty(parseInt(currentPeriod) - 1, { from: staker.address })
      await wait(2000)
    })
    it('Update Delegate Key', async () => {
      newDelegateKey = accounts[2]
      await spankBank.updateDelegateKey(newDelegateKey, {from: staker.address})
      await wait(2000)
    })
    it('Update Booty Base', async () => {
      newBootyBaseKey = accounts[3]
      await spankBank.updateBootyBase(newBootyBaseKey, { from: staker.address })
      await wait(2000)
    })
    it('Vote to Close', async () => {
      await spankBank.voteToClose({ from: staker.address })
      await wait(2000)
    })
    it('Withdraw', async () => {
      await moveForwardPeriods(staker.periods + 1)
      await spankBank.updatePeriod()
      await spankBank.withdrawStake()
      await wait(2000)
    })
  })
})