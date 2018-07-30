# SpankBank Tests

There are three SpankBank tests

1. `spankbank.js` Original happy path tests that help clarify implementation correctness
2. `spank.js` Updated tests that not only explicitly test for all failure conditions but also success scenarios
3. `multisig.js` Happy path scenarios from Gnosis Multisig wallet execution

## Requirements
1. [latest Truffle](https://truffleframework.com/docs/getting_started/installation)
2. [Ganache-cli](https://github.com/trufflesuite/ganache-cli) or [Ganache](https://truffleframework.com/ganache). (Note : only fully tested with `Ganache-cli`)

## Usage
### Running tests
Assuming that the repository has been downloaded, from the `spankbank` directory
1. run ganache-cli : `ganache-cli -m "fetch local valve black attend double eye excite planet primary install allow"`
2. in a separate terminal window run :
	 
    a. `truffle test test/spank.js`
    
    b. `truffle test test/multisig.js`
3. tip : fire up Metamask with the same mnemonic used in Ganache and flip back and forth testing locally using the command line, [remix](http://remix.ethereum.org/) and Rinkeby. Also, works with [Gnosis web wallet](http://wallet.gnosis.pm/).

### Issues
Please submit any [issues](https://github.com/SpankChain/spankbank/issues) you find!