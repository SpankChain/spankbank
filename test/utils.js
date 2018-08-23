function decToBytes(dec) {
  const sixtyFourZeros = '0000000000000000000000000000000000000000000000000000000000000000'
  return String(sixtyFourZeros.substring(0,sixtyFourZeros.length - dec.toString(16).length)) + dec.toString(16)
}

function addrToBytes(address) {
  const twentyFourZeros = '000000000000000000000000'
  const addr = address.split("0x")[1]
  return twentyFourZeros + addr
}

module.exports = { decToBytes, addrToBytes }
