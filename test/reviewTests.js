// const {injectInTruffle} = require(`sol-trace`)
// injectInTruffle(web3, artifacts);
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

contract('SpankBank::stake', (accounts) => {
    before('deploy', async () => {    
      spankbank = await SpankBank.deployed()
      spankToken = await SpankToken.deployed()
      bootyAddress = await spankbank.bootyToken()
      bootyToken = await BootyToken.at(bootyAddress)
    })
  
    describe('booty', () => {
      it('verify BOOTY name', async () => {     
        bootyName = await bootyToken.name.call()
        expect(bootyName).to.be.equal(data.booty.name)
      })
      it('verify BOOTY decimals', async () => {     
        bootyDecimals = await bootyToken.decimals.call()
        bootyDecimals.should.be.bignumber.equal(data.booty.decimals)
      })
      it('verify BOOTY symbol', async () => {     
        bootySymbol = await bootyToken.symbol.call()
        expect(bootySymbol).to.be.equal(data.booty.symbol)
      })
    })
})  