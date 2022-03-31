const {writeTo} = require('./util');
const ENV = process.env;

writeTo('../frontend/scripts/config.js.ejs', {
  authing_app_id: ENV.AUTHING_APP_ID,
  authing_app_name: ENV.AUTHING_APP_NAME,
  sp_redirect_url: ENV.SP_REDIRECT_URL,
  aws_api_id: ENV.AWS_API_ID,
  aws_region: ENV.AWS_DEFAULT_REGION,
  aws_identity_pool_id: ENV.AWS_IDENTITY_POOL_ID,
  aws_bucket_name_test: ENV.AWS_BUCKET_NAME_TEST
}, '../frontend/scripts/config.js');