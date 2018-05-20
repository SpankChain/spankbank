/* global artifacts */

const fs = require('fs')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

module.exports = (deployer, network, accounts) => {

  const data = require('../data.json')

  // I'm not deploying and linking the libraries I depend on for BootyToken...
  // why does this still work?
  // - Theory: if you don't deploy and link the library contract independently,
  // the bytecode of the library will simply be included in the contract itself

  deployer.deploy(
    SpankToken, 
    data.token.totalSupply, 
    data.token.name, 
    data.token.decimals, 
    data.token.symbol
  ).then(() => {
    return deployer.deploy(
      SpankBank, 
      data.spankbank.periodLength, 
      data.spankbank.maxPeriods, 
      SpankToken.address, 
      data.spankbank.initialBootySupply
    )}
  )
}
