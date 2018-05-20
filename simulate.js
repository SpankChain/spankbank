/*
[{
  "stake": 300,
  "start": 1526390743,
  "periods": 3,
  "checkins": [2,2,2],
  "split": [
    {
      "address": "0x123",
      "amount": 20,
      "period": 2
    }
  ]
}]
*/
function calculate(allStakers, startTime, periodInSecs, periodsToSim) {
  const pointsTable = [0, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
  for (let period = 0; period <= periodsToSim; period++) {
    let currentPeriodStartTime = startTime + (periodInSecs * period)
    let nextPeriodStartTime = currentPeriodStartTime + periodInSecs
    let totalStake = 0
    allStakers.map(staker => {
      if (currentPeriodStartTime <= staker.start && nextPeriodStartTime > staker.start) {
        staker['points'] = [], staker['payouts'] = []
        // TODO : airdrop initial BOOTY amount, staker's staked percentage to entire stake
        staker['checkins'].map((checkin, index) => { // checkin : periods to extend stake relative to staker's initial staking period
            let checkinPeriod = index + period + 1
            staker['points'][checkinPeriod] = pointsTable[checkin]
            staker['payouts'][checkinPeriod] = Math.floor(staker['stake'] * (pointsTable[checkin] / 100))
        })
      }
    })
  }
  return allStakers
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createStakers(token, accounts, numBootstrapStakers, publicKeys, simPeriods, startTime, periodLength, maxPeriods) {
  let allStakers = []
  let periods = getRandomInt(0, maxPeriods)
  let endTime = startTime + (simPeriods * periodLength)
  let stakersArray = []

  accounts.map(async (account, index) => {
    let stake = Math.round(Math.random() * 100)
    let splits = []
    let checkins = []

    await token.transfer(account, stake, {from: accounts[0]})

    for (let check = 0; check <= simPeriods; check++) {
      checkins[check] = getRandomInt(0, maxPeriods)
    }

    for (let idx = 0; idx < getRandomInt(0, publicKeys.length); idx++) {
      splits.push([publicKeys[getRandomInt(0, publicKeys.length-1)], getRandomInt(0,100)])
    }

    if (index >= numBootstrapStakers) {
      startTime = getRandomInt(startTime + periodLength, endTime)
    } 

    staker = {
      "address": account,
      "stake": stake,
      "start": startTime,
      "periods": getRandomInt(0, simPeriods),
      "checkins": checkins,
      "splits": splits
    }
    //console.log('staker', staker)
    allStakers.push(staker)
  })
  return allStakers
}

function canStartStaking(staker, startTime, nextPeriodStartTime) {
  return (staker.start >= startTime && staker.start < nextPeriodStartTime)
}

module.exports = {
  calculate: calculate,
  createStakers: createStakers,
  getRandomInt: getRandomInt,
  canStartStaking: canStartStaking
}
