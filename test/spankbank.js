/* global artifacts, contract, assert, web3 */
/* eslint-env mocha */

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

contract('SpankBank', accounts => {
  const owner = accounts[0]

  before('should deploy', async () => {
    this.spankToken = await SpankToken.deployed()
    this.spankbank = await SpankBank.deployed()
  })

  it('should work', async () => {
    const supply = await this.spankToken.totalSupply()
    console.log(supply)
    const spankAddress = await this.spankbank.spankAddress()
    console.log(spankAddress)
    const bootyAddress = await this.spankbank.bootyToken()
    console.log(bootyAddress)
    const bootyToken = await BootyToken.at(bootyAddress)
    const bootyOwner = await bootyToken.owner()
    console.log(bootyOwner)
    console.log(this.spankbank.address)
    const bootySupply = await bootyToken.totalSupply.call()
    console.log(bootySupply)
  })

  it('stake', async () => {
    await this.spankToken.approve(this.spankbank.address, 100)
    await this.spankbank.stake(100, 1)
    const totalSpankStaked = await this.spankToken.balanceOf.call(this.spankbank.address)
    console.log(totalSpankStaked)
    const spankPoints = await this.spankbank.getSpankPoints.call(owner, 1)
    console.log(spankPoints)
  })
})
