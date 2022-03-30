const config = require('./config.json');
const {writeTo} = require('./util');

writeTo('../samconfig.toml.ejs', config, '../samconfig.toml');