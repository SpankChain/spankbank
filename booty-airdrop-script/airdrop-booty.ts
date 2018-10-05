#!/usr/bin/env ts-node

import * as fs from 'fs'
import * as csv from 'fast-csv'
import { BigNumber } from 'bignumber.js'
import { SpankBank, Token } from '@spankdev/spankbank-web3'

BigNumber.config({
  DECIMAL_PLACES: 18,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
})

if (process.argv.length != 3) {
  console.log('USAGE:', process.argv[0], 'config.json')
  process.exit(1)
}

const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'))


const Web3 = require("web3")
const Tx = require('ethereumjs-tx')
const web3 = new Web3(new Web3.providers.HttpProvider(config.rpcUrl))

if (!process.env.PRIVATE_KEY) {
  console.error('Must set PRIVATE_KEY= environment variable')
  process.exit(1)
}

let key = new Buffer(process.env.PRIVATE_KEY.replace(/^0x/, ''), 'hex')

function sleep(timeout) {
  return new Promise(res => setTimeout(res, timeout))
}

async function run() {
  let spankbank = new SpankBank(config.spankBankAddress, web3)
  let bootyToken = new Token(await spankbank.bootyToken(), web3)
  console.log('BOOTY Token:', bootyToken.contractAddress)

  let rows = await new Promise<any[]>((res, rej) => {
    let rows = []
    console.log("Reading from", config.bootyCsv)
    csv.fromPath(config.bootyCsv, { headers: true })
      .on('data', row => rows.push(row))
      .on('error', rej)
      .on('end', () => res(rows))
  })

  let totalPoints = new BigNumber(0)
  let totalStakers = 0
  for (let row of rows) {
    totalPoints = totalPoints.plus(row.staker_points)
    totalStakers += 1
  }

  console.log(config.address)
  let bootyToDisburse = new BigNumber('10069').times('1e18')
  let bootyRemaining = new BigNumber(await bootyToken.balanceOf(config.address))

  console.log('    Total stakers:', totalStakers)
  console.log('      SpankPoints:', totalPoints.toFixed())
  console.log('BOOTY to disburse:', bootyToDisburse.div('1e18').toFixed(), 'remaining:', bootyRemaining.div('1e18').toFixed())

  let maxPendingTransactions = 10
  let pendingTxs = []
  if (fs.existsSync('pending-transactions.json'))
    pendingTxs = JSON.parse(fs.readFileSync('pending-transactions.json', 'utf-8'))

  if (pendingTxs.length) {
    console.log('There are pending transactions from a previous run, checking those first...')
    while (pendingTxs.length) {
      for (let hash of pendingTxs) {
        await new Promise(res => web3.eth.getTransaction(hash, (err, tx) => {
          if (tx && tx.blockNumber)
            pendingTxs = pendingTxs.filter(x => x !== hash)

          console.log(`${hash}: ${err || (tx && tx.blockNumber)}`)
          res()
        }))
      }
      fs.writeFileSync('pending-transactions.temp.json', JSON.stringify(pendingTxs))
      fs.renameSync('pending-transactions.temp.json', 'pending-transactions.json')
      if (pendingTxs.length)
        await sleep(1000)
    }
  }

  function sendBooty(address, amount, txCallback, completeCallback) {
    let bytecode = web3.eth
      .contract(bootyToken.getContractAbi())
      .at(bootyToken.contractAddress)
      .transfer
      .getData(address, amount.toFixed())

    let txObj = {
      gasPrice: web3.toHex(web3.eth.gasPrice),
      gasLimit: web3.toHex(3000000),
      data: bytecode,
      from: config.address,
      to: bootyToken.contractAddress,
      nonce: web3.eth.getTransactionCount(config.address) + pendingTxs.length,
    }
    let tx = new Tx(txObj)
    tx.sign(key)

    let stx = tx.serialize()

    return new Promise(res => {
      web3.eth.sendRawTransaction('0x' + stx.toString('hex'), async (err, hash) => {
        res()
        if (err) {
          let shouldRetry = (
            ('' + err).indexOf('nonce too low') >= 0 ||
            ('' + err).indexOf('replacement transaction underpriced') >= 0
          )
          if (shouldRetry) {
            await sleep(1000)
            sendBooty(address, amount, txCallback, completeCallback)
            return
          }
          console.log(`Error sending to ${address}: ${err}`)
          return completeCallback(false)
        }
        pendingTxs.push(hash)
        fs.writeFileSync('pending-transactions.temp.json', JSON.stringify(pendingTxs))
        fs.renameSync('pending-transactions.temp.json', 'pending-transactions.json')
        txCallback(hash)

        async function poll() {
          await sleep(1000)
          web3.eth.getTransaction(hash, (err, tx) => {
            if (err) {
              console.log(`Error polling for tx ${hash}: ${err}`)
              return completeCallback(false)
            }
            if (tx && tx.blockNumber) {
              pendingTxs = pendingTxs.filter(x => x !== hash)
              return completeCallback(hash)
            }
            poll()
          })
        }

        await sleep(5000)
        poll()
      })
    })
  }

  if (!process.env.REAL)
    console.log('REAL=1 is not set; doing a dry run...')

  let bootyDisbursed = new BigNumber(0)
  let sent = 0
  for (let row of rows) {
    sent += 1
    let curBal = new BigNumber(await bootyToken.balanceOf(row.address))
    let points = new BigNumber(row.staker_points)
    let booty = points.div(totalPoints).times(bootyToDisburse)
    if (booty.mod('1e18').gt('69')) {
      while (!booty.toFixed().match(/69$/) && booty.gt(0)) {
        booty = booty.minus('1')
      }
    }
    bootyDisbursed = bootyDisbursed.plus(booty)
    console.log(`${row.address}: current: ${curBal.div('1e18').toFixed()} points: ${points.toFixed()} booty: ${booty.div('1e18').toFixed()} (${sent}/${rows.length})`)
    if (curBal.gt(booty)) {
      console.error('!!!!!! ERROR !!!!!!!')
      console.error(`${row.address} got too much booty!`)
      console.error('!!!!!! ERROR !!!!!!!')
    }

    if (curBal.gt(0)) {
      if (curBal.lt(booty)) {
        console.error('!!!!!! OH NO !!!!!!!')
        console.error(`${row.address} did not get enoug booty!`)
        console.error('!!!!!! OH NO !!!!!!!')
      }
      continue
    }

    if (!process.env.REAL)
      continue

    await sendBooty(
      row.address,
      booty,
      txHash => console.log(`${row.address}: ${txHash}`),
      confirmed => console.log(`${row.address}: confirmed: ${confirmed}`),
    )
    while (pendingTxs.length >= maxPendingTransactions)
      await sleep(1000)
  }

  while (pendingTxs.length > 0) {
    await sleep(5000)
    console.log('Waiting for transactions:', pendingTxs.join(', '))
  }

  console.log('Done! Disbursed:', bootyDisbursed.div('1e18').toString())

}

run().then(() => process.exit(0))
