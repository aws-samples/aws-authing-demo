const {writeTo} = require('./util');
const ENV = process.env;

const KEY = ENV.AUTHING_PUB_KEY;
let pubKey = null;
try {
  pubKey = JSON.parse(KEY);
} catch (e) {
  console.error('parse public key failed',e);
  process.exit(2);
}

writeTo('../lambda-authorizer/key.js.ejs', {
  authing_pub_key: pubKey
}, '../lambda-authorizer/key.js');