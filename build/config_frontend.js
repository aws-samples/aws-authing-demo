const config = require('./config.json');
const {writeTo} = require('./util');


writeTo('../frontend/scripts/config.js.ejs', config, '../frontend/scripts/config.js');