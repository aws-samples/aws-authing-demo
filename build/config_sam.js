const {writeTo} = require('./util');
const ENV = process.env;

writeTo('../samconfig.toml.ejs', {
  aws_bucket_name_deploy: ENV.AWS_BUCKET_NAME_DEPLOY,
  aws_region: ENV.AWS_DEFAULT_REGION
}, '../samconfig.toml');
