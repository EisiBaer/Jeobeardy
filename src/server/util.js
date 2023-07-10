const crypto = require("crypto");

exports.makeid = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(crypto.randomInt(0, charactersLength) );
    counter += 1;
  }
  return result.toUpperCase();
}