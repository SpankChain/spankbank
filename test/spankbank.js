/* global artifacts, contract, assert, web3 */
/* eslint-env mocha */

const fs = require('fs')

const SpankToken = artifacts.require('./HumanStandardToken')
const BootyToken = artifacts.require('./MintableToken')
const SpankBank = artifacts.require('./SpankBank')

const data = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`))

let spankbank, spankToken, bootyToken

// TODO we are deploying the spank token now, but wont when we do it for
// real - how to test around this? spankAddress is a constructor arg
// we need two different migrations, one for non-mainnet tests (we
// redeploy)
// when we do it for real we will use the spank token address

/*
const verify_deployment = () => {
  it('verify deployment', async () => {

  })
}*/

contract('SpankBank', accounts => {
  const owner = accounts[0]

  before('should deploy', async () => {
    spankbank = await SpankBank.deployed()
    spankToken = await SpankToken.deployed()
    const bootyAddress = await spankbank.bootyToken()
    bootyToken = await BootyToken.at(bootyAddress)
  })

  it('initial parameters are correct', async () => {

    const spankAddress = await spankbank.spankAddress()
    assert.equal(spankAddress, spankToken.address)

    const periodLength = await spankbank.periodLength()
    assert.equal(periodLength, data.spankbank.periodLength)

    const maxPeriods = await spankbank.maxPeriods()
    assert.equal(maxPeriods, data.spankbank.maxPeriods)

    const initialBootySupply = await bootyToken.totalSupply.call()
    assert.equal(initialBootySupply, data.spankbank.initialBootySupply)

    const initialCurrentPeriod = await spankbank.currentPeriod()
    assert.equal(initialCurrentPeriod, 0)

    const initialPeriodData = await spankbank.periods(0)
    const [bootyFees, totalSpankPoints, bootyMinted, mintingComplete, startTime, endTime] = initialPeriodData
    assert.equal(bootyFees, 0)
    assert.equal(totalSpankPoints, 0)
    assert.equal(bootyMinted, 0)
    assert.equal(mintingComplete, false)
    const timeSinceDeployment = new Date().getTime() / 1000 - startTime
    assert.isAtMost(timeSinceDeployment, 5) // at most 5 seconds since deployment
    assert.equal(endTime.toNumber(), startTime.add(periodLength).toNumber())
  })

  it.skip('stake', async () => {
    await this.spankToken.approve(this.spankbank.address, 100)
    await this.spankbank.stake(100, 1)
    const totalSpankStaked = await this.spankToken.balanceOf.call(this.spankbank.address)
    console.log(totalSpankStaked)
    const spankPoints = await this.spankbank.getSpankPoints.call(owner, 1)
    console.log(spankPoints)
  })

  it.skip('sendFees', async () => {
    spankbank.sendBooty(owner, 1000)


  })

  // I have 2.5 hours, I think I can get tests for minting properly done
  // 1. The spankbank is deployed, which immediately starts period 0
  // 2. During period 0, spank can be staked
  // 3. The spank staked won't take effect until period 1
  // 4. The initial booty supply will be distributed proportionally to spank
  //    stakers with a special function (mint initial booty)
  // 5. This can only be called during period 1
  // 6. There can be no booty burned during period 0 because no one has any
  // 7. I need some number of stakers during period 0
  // 8. I need some amount of booty burned during period 1
  // 9. I need to verify the correct amount of booty generated / distributed
  // 10. this involves testing and moving time forward between functions
  // 11. It is probably worth it to set up my tests properly now
  // 12. What does that mean?
})
