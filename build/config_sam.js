const config = require('./config.json');
const {writeTo} = require('./util');

writeTo('../lambda-authorizer/key.js.ejs', config, '../lambda-authorizer/key.js');