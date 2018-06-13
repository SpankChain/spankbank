const HDWalletProvider = require("truffle-hdwallet-provider");

const mnemonic = 'denial replace woman enroll deer client live clog fan rib assume maple'

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // match any network
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/M2xeaVefzxkLhvrTLq43")
      },
      network_id: 4
    }  
  }
};
