const dotenv = require('dotenv').config({ path: '.env.sprinkle' })
var exports = module.exports = {}

const config = require('./config.json')
var prefix = config.prefix

const utils = require('./utils.js')
const c = require('./c.json')

const Common = require('@ethereumjs/common').default
var Tx = require('@ethereumjs/tx').FeeMarketEIP1559Transaction
const HDWalletProvider = require("@truffle/hdwallet-provider")
const Web3 = require('web3')

let nevmProvider = new HDWalletProvider({
  mnemonic: process.env.MNEMONIC,
  providerOrUrl: 'https://rpc.syscoin.org',
  chainId: 57,
  networkId: 57,
  pollingInterval: 8000
})

let sprinklerAddress = nevmProvider.addresses[1]
let web3 = new Web3(nevmProvider)

const common = Common.forCustomChain('mainnet', {
  name: 'SYS',
  networkId: 57,
  chainId: 57
}, 'london')

var discordIds = []

exports.getBalance = async function getBalance(message, signer) {
  try {
    let weiBalance = await web3.eth.getBalance(sprinklerAddress)
    let ethBalance = web3.utils.fromWei(weiBalance)
    message.channel.send({embed: { color: c.SUCCESS_COL, description: `Sprinkler balance:\n\n ${ethBalance} sys`}});
  } catch (error) {
    console.log(error)
    message.channel.send({embed: { color: c.FAIL_COL, description: "Error getting sprinkler balance."}});
    return null
  }
}

exports.deposit = function(message) {
  message.channel.send({embed: { color: c.SUCCESS_COL, description: `Sprinkler deposit address:\n\n${sprinklerAddress}`}});
}

exports.dustEm = async function(args, message) {
  if (!utils.hasAllArgs(args, 1)) {
    message.channel.send({embed: { color: c.FAIL_COL, description: "You haven't provided an address."}});
    return
  }

  if (!web3.utils.isAddress(args[0])) {
    message.channel.send({embed: { color: c.FAIL_COL, description: "That isn't a valid address."}});
    return
  }

  const today = new Date()
  if (discordIds[message.author.id] !== undefined) {
    if (today.getDate() <= discordIds[message.author.id].getDate() && today.getMonth() <= discordIds[message.author.id].getMonth()) {
      message.channel.send(`https://tenor.com/view/robert-deniro-meet-the-fockers-point-looking-at-you-im-watching-you-gif-5145428`).then(msg => {utils.deleteMsgAfterDelay(msg, 7500)})
      message.channel.send({embed: { color: c.FAIL_COL, description: `You can only be dusted once a day. Don't be greedy <@${message.author.id}>`}})
      return
    }
  }

  let rawTx = {
    nonce: await web3.eth.getTransactionCount(sprinklerAddress),
    to: args[0],
    from: sprinklerAddress,
    value: web3.utils.toHex(web3.utils.toWei('200000', 'gwei')),
    gasLimit: web3.utils.toHex(21000),
    maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('1.1', 'gwei')),
    maxFeePerGas: web3.utils.toHex(web3.utils.toWei('1.1001', 'gwei'))
  }

  let tx = new Tx(rawTx, {common: common})
  tx = tx.sign(nevmProvider.wallets[sprinklerAddress].privateKey)
  const serializedTx = tx.serialize()

  web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
    if (err) {
      console.log(err)
      message.channel.send({embed: { color: c.FAIL_COL, description: "Can't sprinkle right now."}});
    } else {
      console.log("success!")
      console.log(hash)
      message.channel.send(`https://tenor.com/view/magic-dust-salt-bae-meme-sprinkle-gif-16676000`).then(msg => {utils.deleteMsgAfterDelay(msg, 7500)})
      message.channel.send({embed: { color: c.SUCCESS_COL, description: `Magical SYS dust sent to <@${message.author.id}>!\n [Explorer](https://explorer.syscoin.org/tx/${hash})`}})
      discordIds[message.author.id] = new Date()
    }
  })
}
