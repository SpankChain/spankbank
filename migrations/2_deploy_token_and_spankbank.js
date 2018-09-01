/* global artifacts */

const fs = require('fs')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

module.exports = (deployer, network, accounts) => {

  const data = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`))

  deployer.deploy(SpankBank, data.spankbank.periodLength, data.spankbank.maxPeriods, data.token.address, data.spankbank.initialBootySupply, data.booty.name, data.booty.decimals, data.booty.symbol)
}
