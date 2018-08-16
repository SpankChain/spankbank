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
  await ethRPC.sendAsync({method: `evm_revert`, id:0}, (err)=> {});
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
  resp = await spankBank.stakers(address)
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
  resp = await spankBank.getPeriod(period)
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

contract('SpankBank::e2e', (accounts) => {
  before('deploy', async () => {
    await restore()
    spankBank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    bootyAddress = await spankBank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)

    maxPeriods = parseInt(await spankBank.maxPeriods())
    initialPeriodData = await spankBank.periods(0)
    startTime = parseInt(initialPeriodData[4])
    endTime = parseInt(initialPeriodData[5])
    periodLength = parseInt(await spankBank.periodLength())

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
    })
    it('Send Fees', async () => {
      await spankBank.sendFees(1, { from: staker.address })
    })
    it('Mint Booty', async () => {
      await moveForwardPeriods(1)
      await spankBank.updatePeriod()
      await spankBank.mintBooty()
    })
    it('Check In', async () => {
      checkInStaker = await getStaker(staker.address)
      checkInPeriod = parseInt(checkInStaker.endingPeriod) + 1
      await spankBank.checkIn(checkInPeriod, { from: staker.address })
    })
    it('Claim Booty', async () => {
      await moveForwardPeriods(1)
      await spankBank.updatePeriod()
      await spankBank.mintBooty()
      currentPeriod = await spankBank.currentPeriod()
      await spankBank.claimBooty(parseInt(currentPeriod) - 1, { from: staker.address })
    })
    it('Split Stake', async () => {
      newStaker = {
        address: accounts[1]
      }
      await spankBank.splitStake(newStaker.address, newStaker.address, newStaker.address, staker.stake, { from: staker.address }) // 5. pass
    })
  })
})


// contract('SpankBank::updateDelegateKey', (accounts) => {
//   before('deploy', async () => {
//     await restore()
//     spankBank = await SpankBank.deployed()
//     spankToken = await SpankToken.deployed()
//     bootyAddress = await spankBank.bootyToken()
//     bootyToken = await BootyToken.at(bootyAddress)

//     maxPeriods = parseInt(await spankBank.maxPeriods())
//     initialPeriodData = await spankBank.periods(0)
//     startTime = parseInt(initialPeriodData[4])
//     endTime = parseInt(initialPeriodData[5])
//     periodLength = parseInt(await spankBank.periodLength())

//     staker = {
//       address : accounts[0],
//       stake : 100,
//       periods : 12
//     }

//     await spankToken.approve(spankBank.address, staker.stake, {from: staker.address})
//     await spankBank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

//     newStaker = {
//       address : accounts[1],
//       stake : 100,
//       periods : 12
//     }

//     await spankToken.transfer(newStaker.address, newStaker.stake, {from: staker.address})
//     await spankToken.approve(spankBank.address, newStaker.stake, {from: newStaker.address})
//     await spankBank.stake(newStaker.stake, newStaker.periods, newStaker.address, newStaker.address, {from : newStaker.address})
//   })

//   describe('updating delegate key has three requirements\n\t1. new delegate key address is not address(0)\n\t2. delegate key is not already in use\n\t3. staker has a valid delegate key to update', () => {
//     it('1. new delegate key is 0x0', async () => {
//       newDelegateKey = "0x0000000000000000000000000000000000000000"
//       bankedStaker = await getStaker(staker.address)
//       stakerDelegateKey = await spankBank.getStakerFromDelegateKey(newDelegateKey)

//       expect(newDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 1. fail
//       expect(stakerDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 2. pass
//       bankedStaker.delegateKey.should.not.be.equal("0x0000000000000000000000000000000000000000") // 3. pass

//       await spankBank.updateDelegateKey(newDelegateKey, {from: staker.address}).should.be.rejectedWith(SolRevert)
//     })
//     it('2. delegate key already assigned', async () => {
//       newDelegateKey = newStaker.address
//       newStakerDelegateKey = await spankBank.getStakerFromDelegateKey(newStaker.address)
//       bankedStaker = await getStaker(staker.address)
//       expect(newDelegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
//       expect(newStakerDelegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 2. fail
//       bankedStaker.delegateKey.should.not.be.equal("0x0000000000000000000000000000000000000000") // 3. pass

//       await spankBank.updateDelegateKey(newStaker.address, {from: staker.address}).should.be.rejectedWith(SolRevert)
//     })
//     it('3. staker does not have valid delegate key', async () => {
//       unknownStaker = {
//         address : accounts[9]
//       }
//       unknownDelegateKey = {
//         address : accounts[8]
//       }
//       unknownStakerDelegateKey = await spankBank.getStakerFromDelegateKey(unknownStaker.address)
//       unknownBankedStaker = await getStaker(unknownStaker.address)
//       expect(unknownStaker).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
//       expect(unknownStakerDelegateKey).to.be.equal("0x0000000000000000000000000000000000000000") // 2. pass
//       unknownBankedStaker.delegateKey.should.be.equal("0x0000000000000000000000000000000000000000") // 3. fail

//       await spankBank.updateDelegateKey(unknownDelegateKey.address, {from: unknownStaker.address}).should.be.rejectedWith(SolRevert)
//     })
//     it('SUCCESS!', async () => {
//       newDelegateKey = accounts[7]
//       newDelegateKeyStakerAddress = await spankBank.getStakerFromDelegateKey(newDelegateKey)
//       bankedStaker = await getStaker(staker.address)
//       expect(newDelegateKey).to.not.be.equal("0x0000000000000000000000000000000000000000") // 1. pass
//       expect(newDelegateKeyStakerAddress).to.be.equal("0x0000000000000000000000000000000000000000") // 2. pass
//       bankedStaker.delegateKey.should.not.be.equal("0x0000000000000000000000000000000000000000") // 3. pass

//       await spankBank.updateDelegateKey(newDelegateKey, {from: staker.address})
//     })
//   })
// })

// contract('SpankBank::updateBootyBase', (accounts) => {
//   before('deploy', async () => {
//     await restore()
//     spankBank = await SpankBank.deployed()
//     spankToken = await SpankToken.deployed()
//     bootyAddress = await spankBank.bootyToken()
//     bootyToken = await BootyToken.at(bootyAddress)

//     maxPeriods = parseInt(await spankBank.maxPeriods())
//     initialPeriodData = await spankBank.periods(0)
//     startTime = parseInt(initialPeriodData[4])
//     endTime = parseInt(initialPeriodData[5])
//     periodLength = parseInt(await spankBank.periodLength())

//     staker = {
//       address : accounts[0],
//       stake : 100,
//       periods : 12
//     }

//     newStaker = {
//       address : accounts[1]
//     }

//     newBootyBase = {
//       address : accounts[2]
//     }

//     await spankToken.approve(spankBank.address, staker.stake, {from: staker.address})
//     await spankBank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})
//   })

//   describe('updating booty base has one requirement\n\t1. staker must have SPANK staked', () => {
//     it('user does not have enough SPANK to stake', async () => {
//       newBankedStaker = await getStaker(newStaker.address)
//       newBankedStaker.stake.should.be.bignumber.equal(0)

//       await spankBank.updateBootyBase(newBootyBase.address, {from : newStaker.address}).should.be.rejectedWith(SolRevert)
//     })
//     it('SUCCESS!', async () => {
//       bankedStaker = await getStaker(staker.address)
//       bankedStaker.stake.should.be.bignumber.above(0)

//       await spankBank.updateBootyBase(newBootyBase.address, {from : staker.address})
//     })
//   })
// })

// contract('SpankBank::voteToClose', (accounts) => {
//   before('deploy', async () => {
//     await restore()
//     spankBank = await SpankBank.deployed()
//     spankToken = await SpankToken.deployed()
//     bootyAddress = await spankBank.bootyToken()
//     bootyToken = await BootyToken.at(bootyAddress)

//     maxPeriods = parseInt(await spankBank.maxPeriods())
//     initialPeriodData = await spankBank.periods(0)
//     startTime = parseInt(initialPeriodData[4])
//     endTime = parseInt(initialPeriodData[5])
//     periodLength = parseInt(await spankBank.periodLength())

//     staker = {
//       address : accounts[0],
//       stake : 100,
//       periods : 1
//     }

//     await spankToken.approve(spankBank.address, staker.stake, {from: staker.address})
//     await spankBank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})

//     zeroStaker = {
//       address : accounts[6],
//       stake : 100
//     }

//     await spankToken.transfer(zeroStaker.address, zeroStaker.stake, {from: staker.address})
//     await spankToken.approve(spankBank.address, zeroStaker.stake, {from: zeroStaker.address})


//     splitStaker = {
//       address : accounts[8],
//       stake : 100,
//       periods : 12
//     }

//     await spankToken.transfer(splitStaker.address, splitStaker.stake, {from: staker.address})
//     await spankToken.approve(spankBank.address, splitStaker.stake, {from: splitStaker.address})

//     closedVoteStaker = {
//       address : accounts[9],
//       stake: 100
//     }

//     await spankToken.transfer(closedVoteStaker.address, closedVoteStaker.stake, {from: staker.address})
//     await spankToken.approve(spankBank.address, closedVoteStaker.stake, {from: closedVoteStaker.address})

//     voteBreakStaker = {
//       address : accounts[7],
//       stake : 500,
//       periods: 12
//     }

//     await spankToken.transfer(voteBreakStaker.address, voteBreakStaker.stake, {from: staker.address})
//     await spankToken.approve(spankBank.address, voteBreakStaker.stake, {from: voteBreakStaker.address})

//     randomStaker = {
//       address : accounts[6],
//       stake: 100,
//       periods: 12
//     }

//     await spankToken.transfer(randomStaker.address, randomStaker.stake, {from: staker.address})
//     await spankToken.approve(spankBank.address, randomStaker.stake, {from: randomStaker.address})

//   })

//   describe('votetoClose has four requires\n\t1. staker spank is greater than zero\n\t2. ending period >= current period\n\t3. staker has not already voted to close in current period\n\t4. spankBank is not closed, \n\tEX. withdraw after SpankBank is closed', () => {
//     it('1. staker spank is zero', async () => {
//       bankedZeroStaker = await getStaker(zeroStaker.address)
//       bankedZeroStaker.address.should.be.equal(zeroStaker.address)
//       bankedZeroStaker.stake.should.be.bignumber.equal(0)

//       await spankBank.voteToClose({ from : zeroStaker.address }).should.be.rejectedWith(SolRevert)
//       await spankBank.stake(splitStaker.stake, splitStaker.periods, splitStaker.address, splitStaker.address, {from : splitStaker.address})

//       expect(await didStake( splitStaker.address, await spankBank.currentPeriod() )).to.be.true

//       currentPeriod = await spankBank.currentPeriod()
//       await moveForwardPeriods(parseInt(currentPeriod) + 1)
//       await spankBank.updatePeriod()

//       stakerFromSplit = { address : accounts[5] }
//       splitTx = await spankBank.splitStake(stakerFromSplit.address, stakerFromSplit.address, stakerFromSplit.address, splitStaker.stake, { from: splitStaker.address })


//       splitStakeEventPayload = await getEventParams(splitTx, "SplitStakeEvent")
//       expect(
//         await validateSplitStakeEvent (
//           splitStaker.stake,
//           await getStaker(splitStaker.address),
//           await getStaker(stakerFromSplit.address),
//           splitStakeEventPayload
//         )
//       ).to.be.true

//       currentPeriod = await spankBank.currentPeriod()
//       bankedSplitStaker = await getStaker(splitStaker.address)
//       bankedSplitStaker.address.should.be.equal(splitStaker.address)
//       bankedSplitStaker.stake.should.be.bignumber.equal(0)
//       bankedSplitStaker.endingPeriod.should.be.bignumber.above(parseInt( await spankBank.currentPeriod() ))

//       await spankBank.voteToClose({from : splitStaker.address}).should.be.rejectedWith(SolRevert)
//     })

//     it('2. staker ending period is less than current period', async () => {
//       await moveForwardPeriods(staker.periods * 2)
//       await spankBank.updatePeriod()

//       bankedStaker = await getStaker(staker.address)
//       bankedStaker.address.should.be.equal(staker.address)
//       bankedStaker.stake.should.be.bignumber.above(0)
//       bankedStaker.stake.should.be.bignumber.equal(staker.stake)

//       expect(await spankBank.getVote(staker.address, currentPeriod)).to.be.false
//       expect(await spankBank.isClosed()).to.be.false

//       await spankBank.updatePeriod()
//       currentPeriod = await spankBank.currentPeriod()
//       bankedStaker.endingPeriod.should.be.bignumber.below(parseInt(currentPeriod))
//       await spankBank.voteToClose({from : staker.address}).should.be.rejectedWith(SolRevert)
//     })

//     it('3. staker already voted to close', async () => {
//       closedVoteStaker.stake = 100
//       closedVoteStaker.periods = 12
//       await spankBank.stake(closedVoteStaker.stake, closedVoteStaker.periods, closedVoteStaker.address, closedVoteStaker.address, {from : closedVoteStaker.address})

//       voteToCloseTx = await spankBank.voteToClose({from : closedVoteStaker.address})
//       payload = await getEventParams(voteToCloseTx, "VoteToCloseEvent")
//       payload.staker.should.be.equal(closedVoteStaker.address)

//       currentPeriod = await spankBank.currentPeriod()
//       closedBankedStaker = await getStaker(closedVoteStaker.address)
//       closedBankedStaker.endingPeriod.should.be.bignumber.above(parseInt(currentPeriod))
//       expect(await spankBank.getVote(closedBankedStaker.address, parseInt(currentPeriod))).to.be.true
//       expect(await spankBank.isClosed()).to.be.false

//       await spankBank.voteToClose({from : closedVoteStaker.address}).should.be.rejectedWith(SolRevert)

//     })

//     it('4. contract is already closed', async () => {
//       randomStakerTx = await spankBank.stake(randomStaker.stake, randomStaker.periods, randomStaker.address, randomStaker.address, {from : randomStaker.address})

//       stakePayload = await getEventParams(randomStakerTx, "StakeEvent")

//       await spankBank.stake(voteBreakStaker.stake, voteBreakStaker.periods, voteBreakStaker.address, voteBreakStaker.address, {from : voteBreakStaker.address})
//       voteTx = await spankBank.voteToClose({from : voteBreakStaker.address})

//       votePayload = await getEventParams(voteTx, "VoteToCloseEvent")
//       votePayload.staker.should.be.equal(voteBreakStaker.address)

//       currentPeriod = await spankBank.currentPeriod()
//       voteBreakBankedStaker = await getStaker(voteBreakStaker.address)
//       voteBreakBankedStaker.endingPeriod.should.be.bignumber.above(parseInt(currentPeriod))
//       expect(await spankBank.getVote(voteBreakBankedStaker.address, parseInt(currentPeriod))).to.be.true
//       expect(await spankBank.isClosed()).to.be.true

//       await spankBank.voteToClose({from : randomStaker.address}).should.be.rejectedWith(SolRevert)
//     })

//     it('EX. withdraw after SpankBank is closed', async () => {
//       bankedZeroStaker = await getStaker(voteBreakStaker.address)
//       await spankBank.withdrawStake({from : voteBreakStaker.address})
//     })
//   })
// })

// contract('SpankBank::withdrawStake', (accounts) => {
//   before('deploy', async () => {
//     await restore()
//     spankBank = await SpankBank.deployed()
//     spankToken = await SpankToken.deployed()
//     bootyAddress = await spankBank.bootyToken()
//     bootyToken = await BootyToken.at(bootyAddress)

//     maxPeriods = parseInt(await spankBank.maxPeriods())
//     initialPeriodData = await spankBank.periods(0)
//     startTime = parseInt(initialPeriodData[4])
//     endTime = parseInt(initialPeriodData[5])
//     periodLength = parseInt(await spankBank.periodLength())

//     staker = {
//       address : accounts[0],
//       stake : 100,
//       periods : 12
//     }

//     await spankToken.approve(spankBank.address, staker.stake, {from: staker.address})
//     await spankBank.stake(staker.stake, staker.periods, staker.address, staker.address, {from : staker.address})
//   })

//   describe('withdraw stake has one requirement\n\t1. current period must be greater than staker ending period', () => {
//     it('1. staking period has not ended', async () => {
//       balance = await spankToken.balanceOf(staker.address)
//       bankedStaker = await getStaker(staker.address)
//       delegateKey = await spankBank.getStakerFromDelegateKey(staker.address)
//       await moveForwardPeriods(3)
//       await spankBank.updatePeriod()
//       bankedStaker = await getStaker(staker.address)

//       bankedStaker.endingPeriod.should.be.bignumber.above( await spankBank.currentPeriod() )
//       await spankBank.withdrawStake().should.be.rejectedWith(SolRevert)
//     })
//     it('SUCCESS!', async () => {
//       await spankBank.updatePeriod() // interacting with contract before moving foward
//       await moveForwardPeriods(staker.periods + 2)
//       await spankBank.updatePeriod()
//       currentPeriod = await spankBank.currentPeriod()
//       // console.log('\tcurrentPeriod', currentPeriod)
//       bankedStaker = await getStaker(staker.address)
//       bankedStaker.endingPeriod.should.be.bignumber.below( currentPeriod )
//       // error below occurs because blockchain does not reliably move forward
//       // solution is to interact with contract before moving foward (line 1268)
//       /*
//       AssertionError: expected '12' to be less than '3'
//       + expected - actual

//       -12
//       +3

//       at Context.it (test/spank.js:1271:53)
//       at <anonymous>
//       at process._tickCallback (internal/process/next_tick.js:160:7)
//       */
//       await spankBank.withdrawStake()
//     })
//   })
// })

