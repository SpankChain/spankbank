/* global artifacts */

const fs = require('fs')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

module.exports = (deployer, network, accounts) => {

  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`))

  deployer.deploy(SpankToken, data.token.totalSupply, data.token.name, data.token.decimals, data.token.symbol)
    .then(() => {
      return deployer.deploy(SpankBank, data.spankbank.periodLength, data.spankbank.maxPeriods, SpankToken.address, data.spankbank.initialBootySupply, data.booty.name, data.booty.decimals, data.booty.symbol)
    })

  // 2592069, 12, "0x42d6622dece394b54999fbd73d108123806f6a18", 10069000000000000000000, "BOOTY", 18, "BOOTY"
}
