/* global artifacts */

const fs = require('fs')

const MultiSigWallet = artifacts.require('./MultiSigWallet')

module.exports = (deployer, network, accounts) => {

  deployer.deploy(MultiSigWallet, [accounts[0], accounts[1]], 2)
    .then(() => {
      return true
    })
}
