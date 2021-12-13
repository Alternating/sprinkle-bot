/**
 * Filename: server.js
 * Description: Syscoin NEVM Discord Faucet Bot
 * Coded by: jg
 *
 **/


const dotenv = require('dotenv').config({ path: '.env.sprinkle' });

const Web3 = require('web3')
let NEVMprovider = new Web3.providers.WebsocketProvider('wss://rpc.syscoin.org/wss')
let web3 = new Web3(NEVMprovider)

const manager = require('./ABIs/SyscoinERC20Manager.json')

var abiDecoder = require('abi-decoder')

// variables
const config = require('./config.json')
var prefix = config.prefix
const MESSAGE_CHAR_LIMIT = 1980;

// requires
const fs = require('fs')
const ccxt = require ('ccxt')
const express = require('express')
const request = require('request')
const axios = require('axios')

const app = express()
app.use(express.static('public'))
app.get('/', function(request, response) {
  response.send("Running botserver")
})

const listener = app.listen(process.env.PORT, function() {
  console.log('Listening on port ' + listener.address().port)
})

// Discord.js initialized
const Discord = require('discord.js')
const client = new Discord.Client()

const utils = require('./utils.js')
const sprinkler = require('./sprinkler.js')

// Constants required
const constants = require("./constants")
const c = require('./c.json')

// split array
function arraySplit(list, howMany) {
  var idx = 0
  result = []
  while (idx < list.length) {
    if (idx % howMany === 0) result.push([])
    result[result.length - 1].push(list[idx++])
  }
  return result
}

// constant functions - split string
const splitString = (string, prepend = '', append = '') => {
  if (string.length <= MESSAGE_CHAR_LIMIT) {
    return [string];
  }
  const splitIndex = string.lastIndexOf('\n', MESSAGE_CHAR_LIMIT - prepend.length - append.length);
  const sliceEnd = splitIndex > 0 ? splitIndex : MESSAGE_CHAR_LIMIT - prepend.length - append.length;
  const rest = splitString(string.slice(sliceEnd), prepend, append);

  return [`${string.slice(0, sliceEnd)}${append}`, `${prepend}${rest[0]}`, ...rest.slice(1)];
};

process.on('SIGINT', function() {
    console.log("Caught interrupt signal")
    process.exit()
})

client.on('ready', () => {
  console.log('Up and running!')
    // set name if not properly set
  if (client.user.username !== config.botname) {
    client.user.setUsername(config.botname)
  }
  client.user.setPresence({ activity: { name: 'Type !help' }, status: 'Active' })
})

client.on('message', async message => {
  try {
    if (message.author.bot) { return }  // no bots
    if (message.channel.id !== config.dustChannel) {
      return
    }

    // log all interactions
    if (message.content != "") { console.log(`LOG: ${message.createdTimestamp} #${message.channel.name} ${message.author.id} <@${message.author.id}>: ${message.content}`) }
    for(var i = 0; i < message.embeds.length; i++) { console.log(`LOG: ${message.createdTimestamp} #${message.channel.name} ${message.author.id} <@${message.author.id}>: ${message.embeds[i].description}`) }

    var splitter = message.content.replace(" ", ":splitter185151813367::")
    var fixspaces = splitter.replace(":splitter185151813367:::splitter185151813367::", ":splitter185151813367::")
    var splitted = fixspaces.split(":splitter185151813367::")

    //  var splitted = splitter.split(":splitter185151813367::")
    var prefix = config.prefix
    var fixRegExp = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    var re = new RegExp(fixRegExp)
    var command = splitted[0].replace(re, "")
    if (splitted[1]) {
      var args = splitted[1].split(" ")
    }
    else {
     var args = false
    }

    // fix double space
    if (args[0] == ("")) { args.shift() }

    if (message.author.bot) {
       return false
    }
    var works = false

    if ((!splitted[0] || !splitted[0].match(prefix)) && !works) {
      return false
      //No prefix detected
    }

      //Check for command
      switch (command) {
        case "help":
          message.channel.send({embed: { color: c.SUCCESS_COL, description: constants.help("sprinkler")}})
          break

        case "balance":
          sprinkler.getBalance(message)
          break

        case "dustme":
          sprinkler.dustEm(args, message)
          break

        case "deposit":
          sprinkler.deposit(message)
        default:
        break
      }
    } catch (error) {
      console.log(error)
    }
})

/*
const managerContract = new web3.eth.Contract(manager.abi, '0xA738a563F9ecb55e0b2245D1e9E380f0fE455ea1')

managerContract.getPastEvents('allEvents', { fromBlock: 0 }, function(err, events) {
  //console.log(events);
})*/

client.login(config.discordKey)
