#!/usr/bin/env node

/*
1. download and install node.js : https://nodejs.org/
2. make script executable : chmod 775 extraData.js
3. type : ./extraData.js <periods to stake> <delegate key> <booty base>
    ex. ./extraData.js 12 0x9a8d670c323e894dda9a045372a75d607a47cb9e 0x9a8d670c323e894dda9a045372a75d607a47cb9e
*/

const Web3 = require('web3')
const web3 = new Web3(Web3.givenProvider)

let periods = "0"

if(Number(process.argv[2]) > 12 || Number(process.argv[2]) < 1)
    throw "period must be between 0 and 12"

switch(Number(process.argv[2])) {
    case 10 :
    periods += "a"
        break;
    case 11 :
    periods += "b"
        break;        
    case 12 :
    periods += "c"
        break;
    default :
    periods = parseInt(process.argv[2])
        break;
} 

if (!web3.utils.isAddress(process.argv[3]) || process.argv[3].indexOf("0x") != 0)
    throw "delegate key is not a valid address"

if (!web3.utils.isAddress(process.argv[4]) || process.argv[4].indexOf("0x") != 0)
    throw "booty base is not a valid address"    

const delegateKey = process.argv[3].toString().split("0x")[1]
const bootyBase = process.argv[4].toString().split("0x")[1]

extraData = '0x0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000' + delegateKey + '000000000000000000000000' + bootyBase + '00000000000000000000000000000000000000000000000000000000000000' + periods 

console.log("\n" + extraData + "\n")
process.exit(0)

