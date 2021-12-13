var exports = module.exports = {};

var FAIL_EMOJI = "❌"
var SUCCESS_EMOJI = "✅"

const Discord = require('discord.js');

const BigNumber = require('bignumber.js')

const config = require('./config.json')
const backendURL = config.blockURL

// converts a bignumber.js number to bn.js (used by syscoinjs-lib)
exports.bigNumberToBN = function(bigNumber) {
  return new BN(bigNumber.toString())
}

// deletes the message after the given delay in milliseconds
exports.deleteMsgAfterDelay = function(msg, tOut) {
  msg.delete({timeout: tOut})
}

// reacts to a given message with the specified success/failure emoji
exports.isSuccessMsgReact = function(isSuccess, message) {
  if (message && message !== undefined) {
    if (isSuccess) {
      message.react(SUCCESS_EMOJI)
    } else {
      message.react(FAIL_EMOJI)
    }
  }
}

// checks if the correct number of arguments have been provided
exports.hasAllArgs = function(args, numOfArgs) {
  return args.length >= numOfArgs
}
