const HttpProvider = require(`ethjs-provider-http`)
const EthRPC = require(`ethjs-rpc`)
const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'))

const BigNumber = web3.BigNumber
const should = require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should()
const SolRevert = 'VM Exception while processing transaction: revert'

const MultiSigWallet = artifacts.require('./MultiSigWallet')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintAndBurnToken')
const SpankBank = artifacts.require('./SpankBank')

const data = require('../data.json')
const pointsTable = [0, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]

async function snapshot() {
  await ethRPC.sendAsync({method: `evm_snapshot`, id:0}, (err)=> {});
}

async function restore() {
  await ethRPC.sendAsync({method: `evm_revert`, id:0}, (err)=> {});
}

/* convenience functions */
async function moveForwardPeriods(periods) {
  const goToTime = data.spankbank.periodLength * periods
  await ethRPC.sendAsync({jsonrpc:'2.0', method: `evm_increaseTime`, params: [goToTime]}, (err)=> {`error increasing time`});
  return await ethRPC.sendAsync({method: `evm_mine`}, (err)=> {assert.equal(err, null, `error force mining`)});
}

async function getStaker(address) {
  resp = await spankbank.stakers(address)
  return {address : address, stake : resp[0], startingPeriod : resp[1], endingPeriod : resp[2], delegateKey : resp[3], bootyBase: resp[4] }
}

function rmZeroX(address) {
  if (String(address).indexOf("0x") == 0) {
    return address.split("0x")[1]
  } else {
    return address
  }
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

async function getPeriod(period) {
  resp = await spankbank.getPeriod(period)
  return { period : period, bootyFees : resp[0], totalSpankPoints : resp[1], bootyMinted : resp[2], mintingComplete : resp[3], startTime: resp[4], endTime: resp[5] }
}

function multiSigStake(spender, delegateKey, bootyBase, stakeAmount, periodLength) {
  stakeAmountHex = rmZeroX(stakeAmount)
  periodLengthHex = rmZeroX(periodLength)

  let data = "0xcae9ca51000000000000000000000000" + rmZeroX(spender)
  data += decToBytes(stakeAmountHex)
  data += "000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000060000000000000000000000000"
  data += rmZeroX(delegateKey)
  data += "000000000000000000000000"
  data += rmZeroX(bootyBase)
  data += decToBytes(periodLengthHex)

  return data
}

function multiSigCheckIn(updatedEndingPeriod) {
  return '0xe95a644f' + decToBytes(updatedEndingPeriod)
}

function multiSigClaimBooty(_period) {
  return '0xa0ac5776' + decToBytes(_period)
}

function multiSigApprove(_spender, _value) {
  return '0x095ea7b3' + addrToBytes(_spender) + decToBytes(_value)
}

function multiSigSendFees(bootyAmount) {
  return '0xecd4eb74' + decToBytes(bootyAmount)
}

function multiSigMintBooty() {
  return '0x53547d3f'
}

function multiSigSplitStake(newAddress, newDelegateKey, newBootyBase, spankAmount) {
  return '0xb8c0517a' + addrToBytes(newAddress) + addrToBytes(newDelegateKey) + addrToBytes(newBootyBase) + decToBytes(spankAmount)
}

function multiSigUpdateDelegateKey(newDelegateKey) {
  return '0x2582bf2a' + addrToBytes(newDelegateKey)
}

function multiSigUpdateBootyBase(newBootyBase) {
  return '0x948cfd0c' + addrToBytes(newBootyBase)
}

function multiSigVoteToClose() {
  return '0x2277466b'
}

function multiSigWithdrawStake() {
  return '0xbed9d861'
}

async function getLatestConfirmation(multisig) {
  txCount = await multisig.transactionCount()
  txId = parseInt(txCount) -1
  confirmation = await multisig.getConfirmations(txId)
  return confirmation
}

contract('SpankBank', (accounts) => {
  describe('Snapshot', () => {
    it('take snapshot', async () => {
      await snapshot()
    })
  })
})

contract('SpankBank', (accounts) => {
    before('deploy', async () => {    
      await restore()
      owner = accounts[0]
      firstMsig = accounts[0]
      secondMsig = accounts[1]
      spankbank = await SpankBank.deployed()
      spankToken = await SpankToken.deployed()
      bootyAddress = await spankbank.bootyToken()
      bootyToken = await BootyToken.at(bootyAddress)
      multisig = await MultiSigWallet.deployed()
      
      maxPeriods = parseInt(await spankbank.maxPeriods())
      initialPeriodData = await spankbank.periods(0)
      startTime = parseInt(initialPeriodData[4])
      endTime = parseInt(initialPeriodData[5])
      periodLength = parseInt(await spankbank.periodLength())

      msStaker = {
        address : multisig.address,
        stake : 2,
        delegateKey : multisig.address,
        bootyBase : multisig.address,
        periods : 12
      }
  
      await spankToken.transfer(msStaker.address, 1000000000000000000000, {from: owner})
      await bootyToken.transfer(msStaker.address, 1000000000000000000000, {from: owner})
      
      multiSigStake = multiSigStake(spankbank.address, msStaker.delegateKey, msStaker.bootyBase, msStaker.stake, msStaker.periods)
    })
  
    describe('multi-sig stake', () => {
      it('submit first multi-sig tx', async () => {
        await multisig.submitTransaction(spankToken.address, 0, multiSigStake, {from:firstMsig})
      })

      it('verify first multi-sig tx', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(1)
      })

      it('submit second multi-sig tx', async () => {
        confirmTx = await multisig.confirmTransaction(0, {from:secondMsig})
      })

      it('verify Execution event', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(0)
      })
        
      it('verify multi-sig tx is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(0)
        expect(isConfirmed).to.be.true
      })
        
      it('verify multi-sig tx address', async () => {
        tx = await multisig.transactions(0)
        tx[0].should.be.equal(spankToken.address)  
      })

      it('verify multi-sig tx value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx encoded data', async () => {
        tx[2].should.be.equal(multiSigStake)
      })

      it('verify multi-sig tx executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify multi-sig staker address', async () => {
        msBankedStaker = await getStaker(msStaker.address)
        msBankedStaker.address.should.be.equal(msStaker.address)
      })

      it('verify multi-sig staker stake', async () => {
        msBankedStaker.stake.should.be.bignumber.equal(msStaker.stake)
      })

      it('verify multi-sig staker delegateKey', async () => {
        msBankedStaker.delegateKey.should.be.equal(msStaker.delegateKey)
      })

      it('verify multi-sig staker bootyBase', async () => {
        msBankedStaker.bootyBase.should.be.equal(msStaker.bootyBase)
      })

      it('verify multi-sig staker periods', async () => {
        msPeriodLength = parseInt(msBankedStaker.endingPeriod) - parseInt(msBankedStaker.startingPeriod) + 1
        msPeriodLength.should.be.equal(msStaker.periods)
      })
    })

    describe('multi-sig checkIn', () => {
      it('move forward one period', async () => {
        await moveForwardPeriods(1)
        await spankbank.updatePeriod()
      })
      
      it('submit first multi-sig tx for checkIn()', async () => {
        await multisig.submitTransaction(spankbank.address, 0, multiSigCheckIn(13), {from:secondMsig})
      })

      it('verify first multi-sig tx for checkIn()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(2)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(secondMsig)
      })

      it('submit second multi-sig tx for checkIn()', async () => {
        confirmTx = await multisig.confirmTransaction(1, {from:firstMsig})
      })

      it('verify Execution event for checkIn()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(1)
      })

      it('verify multi-sig tx for checkIn() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(1)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for checkIn() address', async () => {
        tx = await multisig.transactions(1)
        tx[0].should.be.equal(spankbank.address)  
      })

      it('verify multi-sig tx for checkIn() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for checkIn() encoded data', async () => {
        tx[2].should.be.equal(multiSigCheckIn(13))    
      })

      it('verify multi-sig tx for checkIn() executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify multi-sig staker address for checkIn()', async () => {
        msBankedStaker = await getStaker(msStaker.address)
        msBankedStaker.address.should.be.equal(msStaker.address)
      })

      it('verify multi-sig ending period for checkIn()', async () => {
        msBankedStaker.endingPeriod.should.be.bignumber.equal(13)
      })
    })

    describe('multi-sig mintBooty', () => {      
      it('submit first multi-sig tx for mintBooty()', async () => {
        await multisig.submitTransaction(spankbank.address, 0, multiSigMintBooty(), {from:firstMsig})
      })

      it('verify first multi-sig tx for mintBooty()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(3)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(firstMsig)
      })

      it('submit second multi-sig tx for mintBooty()', async () => {
        confirmTx = await multisig.confirmTransaction(2, {from:secondMsig})
      })

      it('verify Execution event for mintBooty()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(2)
      })

      it('verify multi-sig tx for mintBooty() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(2)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for mintBooty() address', async () => {
        tx = await multisig.transactions(2)
        tx[0].should.be.equal(spankbank.address)  
      })

      it('verify multi-sig tx for mintBooty() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for mintBooty() encoded data', async () => {
        tx[2].should.be.equal(multiSigMintBooty())    
      })

      it('verify multi-sig tx for mintBooty() executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify period for mintBooty()', async () => {
        getPeriodData = await getPeriod(0)
        getPeriodData.mintingComplete.should.be.true
      })
    })

    describe('multi-sig claimBooty', () => {
      it('move forward one period', async () => {
        await moveForwardPeriods(1)
        await spankbank.updatePeriod()
      })
      
      it('submit first multi-sig tx for claimBooty()', async () => {      
        await multisig.submitTransaction(spankbank.address, 0, multiSigClaimBooty(0), {from:secondMsig})
      })

      it('verify first multi-sig tx for claimBooty()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(4)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(secondMsig)
      })

      it('submit second multi-sig tx for claimBooty()', async () => {
        confirmTx = await multisig.confirmTransaction(3, {from:firstMsig})
      })

      it('verify Execution event for claimBooty()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(3)
      })

      it('verify multi-sig tx for claimBooty() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(3)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for claimBooty() address', async () => {
        tx = await multisig.transactions(3)
        tx[0].should.be.equal(spankbank.address)  
      })

      it('verify multi-sig tx for claimBooty() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for claimBooty() encoded data', async () => {
        tx[2].should.be.equal(multiSigClaimBooty(0))    
      })

      it('verify multi-sig tx for claimBooty() executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify multi-sig staker address for claimBooty()', async () => {
        msClaimedStaker = await spankbank.getDidClaimBooty(msStaker.address, 0)
        msClaimedStaker.should.be.true
      })
    })

    describe('multi-sig splitStake', () => {      
      it('submit first multi-sig tx for splitStake()', async () => {      
        await multisig.submitTransaction(spankbank.address, 0, multiSigSplitStake(accounts[9], accounts[8], accounts[7], 1), {from:firstMsig})
      })

      it('verify first multi-sig tx for splitStake()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(5)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(firstMsig)
      })

      it('submit second multi-sig tx for splitStake()', async () => {
        confirmTx = await multisig.confirmTransaction(4, {from:secondMsig})
      })

      it('verify Execution event for splitStake()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(4)
      })

      it('verify multi-sig tx for splitStake() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(4)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for splitStake() address', async () => {
        tx = await multisig.transactions(4)
        tx[0].should.be.equal(spankbank.address)  
      })

      it('verify multi-sig tx for splitStake() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for splitStake() encoded data', async () => {
        tx[2].should.be.equal(multiSigSplitStake(accounts[9], accounts[8], accounts[7], 1))    
      })

      it('verify multi-sig tx for splitStake() executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify split staker address for splitStake()', async () => {
        msBankedStaker = await getStaker(msStaker.address)
        msSplitStaker = await getStaker(accounts[9])
        msSplitStaker.address.should.be.equal(accounts[9])
      })

      it('verify split delegateKey address for splitStake()', async () => {
        msSplitStaker.delegateKey.should.be.equal(accounts[8])
      })
      
      it('verify split bootyBase address for splitStake()', async () => {
        msSplitStaker.bootyBase.should.be.equal(accounts[7])
      })
        
      it('verify split stake splitStake()', async () => {
        msSplitStaker.stake.should.be.bignumber.equal(1)
      })

      it('verify split startingPeriod splitStake()', async () => {
        msSplitStaker.endingPeriod.should.be.bignumber.equal(msBankedStaker.endingPeriod)
      })

      it('verify split endingPeriod splitStake()', async () => {
        msSplitStaker.startingPeriod.should.be.bignumber.equal(msBankedStaker.startingPeriod)
      })
    })

    describe('multi-sig updateDelegateKey', () => {      
      it('submit first multi-sig tx for updateDelegateKey()', async () => {      
        await multisig.submitTransaction(spankbank.address, 0, multiSigUpdateDelegateKey(accounts[6]), {from:secondMsig})
      })

      it('verify first multi-sig tx for updateDelegateKey()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(6)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(secondMsig)
      })

      it('submit second multi-sig tx for updateDelegateKey()', async () => {
        confirmTx = await multisig.confirmTransaction(5, {from:firstMsig})
      })

      it('verify Execution event for updateDelegateKey()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(5)
      })

      it('verify multi-sig tx for updateDelegateKey() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(5)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for updateDelegateKey() address', async () => {
        tx = await multisig.transactions(5)
        tx[0].should.be.equal(spankbank.address)  
      })

      it('verify multi-sig tx for updateDelegateKey() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for updateDelegateKey() encoded data', async () => {
        tx[2].should.be.equal(multiSigUpdateDelegateKey(accounts[6]))    
      })

      it('verify multi-sig tx for updateDelegateKey() executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify delegateKey for updateDelegateKey()', async () => {
        msBankedStaker = await getStaker(msStaker.address)
        msBankedStaker.delegateKey.should.be.equal(accounts[6])
      })
    })

    describe('multi-sig updateBootyBase', () => {      
      it('submit first multi-sig tx for updateBootyBase()', async () => {      
        await multisig.submitTransaction(spankbank.address, 0, multiSigUpdateBootyBase(accounts[5]), {from:firstMsig})
      })

      it('verify first multi-sig tx for updateBootyBase()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(7)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(firstMsig)
      })

      it('submit second multi-sig tx for updateBootyBase()', async () => {
        confirmTx = await multisig.confirmTransaction(6, {from:secondMsig})
      })

      it('verify Execution event for updateBootyBase()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(6)
      })

      it('verify multi-sig tx for updateBootyBase() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(6)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for updateBootyBase() address', async () => {
        tx = await multisig.transactions(6)
        tx[0].should.be.equal(spankbank.address)  
      })

      it('verify multi-sig tx for updateBootyBase() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for updateBootyBase() encoded data', async () => {
        tx[2].should.be.equal(multiSigUpdateBootyBase(accounts[5]))    
      })

      it('verify multi-sig tx for updateBootyBase() executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify delegateKey for updateBootyBase()', async () => {
        msBankedStaker = await getStaker(msStaker.address)
        msBankedStaker.bootyBase.should.be.equal(accounts[5])
      })
    })    

    describe('multi-sig approve (for sendFees)', () => {      
      it('submit first multi-sig tx for approve()', async () => {      
        await multisig.submitTransaction(bootyToken.address, 0, multiSigApprove(spankbank.address, 1000000000000000000000000), {from:secondMsig})
      })

      it('verify first multi-sig tx for approve()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(8)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(secondMsig)
      })

      it('submit second multi-sig tx for approve()', async () => {
        confirmTx = await multisig.confirmTransaction(7, {from:firstMsig})
      })

      it('verify Execution event for approve()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(7)
      })

      it('verify multi-sig tx for approve() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(7)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for approve() address', async () => {
        tx = await multisig.transactions(7)
        tx[0].should.be.equal(bootyToken.address)  
      })

      it('verify multi-sig tx for approve() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for approve() encoded data', async () => {
        tx[2].should.be.equal(multiSigApprove(spankbank.address, 1000000000000000000000000))    
      })

      it('verify multi-sig tx for approve() executed bool', async () => {
        tx[3].should.be.true      
      })
    })  
    
    describe('multi-sig sendFees', () => {      
      it('submit first multi-sig tx for sendFees()', async () => {      
        await multisig.submitTransaction(spankbank.address, 0, multiSigSendFees(1), {from:firstMsig})
      })

      it('verify first multi-sig tx for sendFees()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(9)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(firstMsig)
      })

      it('submit second multi-sig tx for sendFees()', async () => {
        confirmTx = await multisig.confirmTransaction(8, {from:secondMsig})
      })

      it('verify Execution event for sendFees()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(8)
      })

      it('verify multi-sig tx for sendFees() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(8)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for sendFees() address', async () => {
        tx = await multisig.transactions(8)
        tx[0].should.be.equal(spankbank.address)  
      })

      it('verify multi-sig tx for sendFees() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for sendFees() encoded data', async () => {
        tx[2].should.be.equal(multiSigSendFees(1))    
      })

      it('verify multi-sig tx for sendFees() executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify multi-sig tx for sendFees() booty fees for period', async () => {
        currentPeriod = await spankbank.currentPeriod()
        period = await getPeriod(parseInt(currentPeriod))  
        period.bootyFees.should.be.bignumber.equal(1)
      })
    })
    
    describe('multi-sig voteToClose', () => {      
      it('submit first multi-sig tx for voteToClose()', async () => {      
        await multisig.submitTransaction(spankbank.address, 0, multiSigVoteToClose(), {from:secondMsig})
      })

      it('verify first multi-sig tx for voteToClose()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(10)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(secondMsig)
      })

      it('submit second multi-sig tx for voteToClose()', async () => {
        confirmTx = await multisig.confirmTransaction(9, {from:firstMsig})
      })

      it('verify Execution event for voteToClose()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(9)
      })

      it('verify multi-sig tx for voteToClose() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(9)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for voteToClose() address', async () => {
        tx = await multisig.transactions(9)
        tx[0].should.be.equal(spankbank.address)  
      })

      it('verify multi-sig tx for voteToClose() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for voteToClose() encoded data', async () => {
        tx[2].should.be.equal(multiSigVoteToClose())    
      })

      it('verify multi-sig tx for voteToClose() executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify multi-sig tx for voteToClose() vote for period', async () => {
        currentPeriod = await spankbank.currentPeriod()
        getVoteData = await spankbank.getVote(msStaker.address, parseInt(currentPeriod))
        getVoteData.should.be.true
      })
    })    

    describe('multi-sig withdrawStake', () => {      
      it('fast forward past staker endingPeriod', async () => {   
        msBankedStaker = await getStaker(msStaker.address)
        await moveForwardPeriods(parseInt(msBankedStaker.endingPeriod) + 1)
        await spankbank.updatePeriod()
      })
      it('submit first multi-sig tx for withdrawStake()', async () => {      
        await multisig.submitTransaction(spankbank.address, 0, multiSigWithdrawStake(), {from:firstMsig})
      })

      it('verify first multi-sig tx for withdrawStake()', async () => {
        txCount = await multisig.transactionCount()
        txCount.should.be.bignumber.equal(11)
        getLatestConfirmationData = await getLatestConfirmation(multisig)
        expect(getLatestConfirmationData[0]).to.be.equal(firstMsig)
      })

      it('submit second multi-sig tx for withdrawStake()', async () => {
        confirmTx = await multisig.confirmTransaction(10, {from:secondMsig})
      })

      it('verify Execution event for withdrawStake()', async () => {
        getEventParams(confirmTx, "Execution").transactionId.should.be.bignumber.equal(10)
      })

      it('verify multi-sig tx for withdrawStake() is confirmed', async () => {
        isConfirmed = await multisig.isConfirmed(10)
        expect(isConfirmed).to.be.true
      })

      it('verify multi-sig tx for withdrawStake() address', async () => {
        tx = await multisig.transactions(10)
        tx[0].should.be.equal(spankbank.address)  
      })

      it('verify multi-sig tx for withdrawStake() value', async () => {
        tx[1].should.be.bignumber.equal(0)
      })

      it('verify multi-sig tx for withdrawStake() encoded data', async () => {
        tx[2].should.be.equal(multiSigWithdrawStake())    
      })

      it('verify multi-sig tx for withdrawStake() executed bool', async () => {
        tx[3].should.be.true      
      })

      it('verify multi-sig tx for withdrawStake() vote for period', async () => {
        msBankedStaker = await getStaker(msStaker.address)
        msBankedStaker.stake.should.be.bignumber.equal(0)
      })
    })    
  })