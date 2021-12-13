//Changing variable - Only for prefix code
const config = require('./config.json')
const prefix = config.prefix

//Constant variables - Will not and should not be changed in the code
function getHelpCommands(parm) {
  switch(parm) {
    case "sprinkler":
    return `
      **Sprinkle-bot Commands**
      ~~--------------------~~
      **\`${prefix}balance\`**  Shows the balance of the sprinkler.
      **\`${prefix}dustme [address]\`** Sprinkles the given NEVM address with magical SYS dust.
      **\`${prefix}deposit\`**  Shows the deposit address for the sprinkler.
          `;
    break
    default:
  }
}

module.exports = {
    help: getHelpCommands
}
