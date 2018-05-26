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
    let stake = getRandomInt(0, 100)
    let splits = []
    let checkins = []

    // first numBootstrapStakers elements of accounts stake at period 0
    if (index >= numBootstrapStakers) {
      startTime = getRandomInt(startTime + periodLength, endTime)
    } 

    for (let check = 1; check <= simPeriods; check++) {
      checkins[check] = getRandomInt(0, maxPeriods) + periods
    }

    for (let idx = 0; idx < getRandomInt(0, publicKeys.length); idx++) {
      splits.push([publicKeys[getRandomInt(0, publicKeys.length-1)], getRandomInt(0,100)])
    }

    staker = {
      "address": account,
      "stake": parseInt(stake),
      "start": parseInt(startTime),
      "periods": getRandomInt(1, maxPeriods),
      "checkins": checkins,
      "splits": splits
    }
    //console.log('staker', staker)
    allStakers.push(staker)
  })
  return allStakers
}

module.exports = {
  calculate: calculate,
  createStakers: createStakers,
  getRandomInt: getRandomInt
}
