const fs = require('fs')
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

    stakers = {
      everything: {
        address: accounts[0],
        stake: 690,
        delegateKey: accounts[0],
        bootyBase: accounts[0],
        periods: 12,
      },

      splitTarget: {
        address: accounts[1],
      },

      delegateTarget: {
        address: accounts[2],
      },

      bootyBaseTarget: {
        address: accounts[3],
      },

      stakeOnly: {
        address: accounts[4],
        stake: 691,
        periods: 5,
      },

      stakeMint: {
        address: accounts[5],
        stake: 692,
        periods: 6,
      },

      stakeMintClaim: {
        address: accounts[6],
        stake: 693,
        periods: 7,
      },

    }

    // This is used by the tests in service-spankbank so it doesn't need to
    // hard-code addresses.
    fs.writeFileSync('/tmp/sc-spankbank-explorer-test-stakers.json', JSON.stringify(stakers))
  })

  let steps = [
    { account: 'everything', action: 'approve' },
    { account: 'stakeOnly', action: 'approve' },
    { account: 'stakeMint', action: 'approve' },
    { account: 'stakeMintClaim', action: 'approve' },

    { account: 'everything', action: 'stake' },
    { account: 'stakeOnly', action: 'stake' },
    { account: 'stakeMint', action: 'stake' },
    { account: 'stakeMintClaim', action: 'stake' },

    { action: 'moveForwardPeriods' },

    { account: 'everything', action: 'splitStake', target: 'splitTarget' },

    { account: 'everything', action: 'checkIn' },
    { account: 'stakeMint', action: 'checkIn' },
    { account: 'stakeMintClaim', action: 'checkIn' },

    { action: 'burnBooty', amount: 1e26 },

    { action: 'moveForwardPeriods' },

    { action: 'mintBooty' },

    { account: 'everything', action: 'claimBooty' },
    { account: 'stakeMintClaim', action: 'claimBooty' },

    { account: 'everything', action: 'updateDelegateKey', target: 'delegateTarget' },

    { account: 'everything', action: 'updateBootyBase', target: 'bootyBaseTarget' },

    { account: 'everything', action: 'voteToClose' },

    { action: 'moveForwardPeriods', count: 12 },

    { account: 'everything', action: 'withdraw' },

  ]

  let actions = {
    approve: async (account, step) => {
      await spankToken.transfer(account.address, account.stake)
      await spankToken.approve(spankBank.address, account.stake, {from: account.address})
    },

    stake: async (account, step) => {
      await spankBank.stake(
        account.stake,
        account.periods,
        account.delegateKey || account.address,
        account.bootyBase || account.address,
        { from: account.address }
      )
    },

    splitStake: async (account, step) => {
      newStaker = {
        address: stakers[step.target].address,
      }

      await spankBank.splitStake(newStaker.address, newStaker.address, newStaker.address, account.stake/2, { from: account.address })
    },

    moveForwardPeriods: async (_, step) => {
      await moveForwardPeriods(step.count || 1)
      await spankBank.updatePeriod()
    },

    checkIn: async (account, step) => {
      await spankBank.checkIn(0, { from: account.address })
    },

    burnBooty: async (account, step) => {
      await bootyToken.approve(spankBank.address, step.amount)
      await spankBank.sendFees(step.amount)
    },

    mintBooty: async (account, step) => {
      await spankBank.mintBooty()
    },

    claimBooty: async (account, step) => {
      currentPeriod = await spankBank.currentPeriod()
      await spankBank.claimBooty(parseInt(currentPeriod) - 1, { from: account.address })
    },

    updateDelegateKey: async (account, step) => {
      await spankBank.updateDelegateKey(stakers[step.target].address, {from: account.address})
    },

    updateBootyBase: async (account, step) => {
      await spankBank.updateBootyBase(stakers[step.target].address, { from: account.address })
    },

    voteToClose: async (account, step) => {
      await spankBank.voteToClose({ from: account.address })
    },

    withdraw: async (account, step) => {
      await spankBank.withdrawStake({ from: account.address })
    },
  }

  describe('All SpankBank Events', () => {
    steps.forEach((step, idx) => {
      it(`${idx + 1}. ${JSON.stringify(step)}`, async () => {
        let func = actions[step.action]
        await func(stakers[step.account], step)
      })
    })
  })
})
