const app_domian = `${app_name}.authing.cn`;
const authing_oidc_issue_suffix = `${app_domian}/oidc`;
// const authing_oidc_issue = `https://${authing_oidc_issue_suffix}`;
const login_params = $.param({
  client_id: app_id,
  redirect_uri: sp_redirect_url,
  scope: 'openid profile',
  response_type: 'id_token token',
  state: 'jazz',
  nonce: '1831289'
});
const authing_oidc_login_url = `https://${app_domian}/oidc/auth?${login_params}`;
const logout_params = $.param({
  app_id: app_id,
  redirect_uri: sp_redirect_url
});
const authing_oidc_logout_url = `https://${app_domian}/oidc/session/end?${logout_params}`;
const aws_domain = region.startsWith('cn-') ? 'amazonaws.com.cn' : 'amazonaws.com';
const auth_via_lambda_api_url = `https://${aws_lambda_auth_api_id}.execute-api.${region}.${aws_domain}/Prod/info`;
const auth_via_oidc_api_url = `https://${aws_oidc_auth_api_id}.execute-api.${region}.${aws_domain}/Prod/oidc-test`;
const awsCredentialsPromise = $.Deferred();
const queryString = window.location.hash.substring(1);
const urlParams = new URLSearchParams(queryString);
const NAME_ID_TOKEN = 'id_token';
const id_token = urlParams.get(NAME_ID_TOKEN);

function showApiResult(url, id_token, $resultArea) {
  //请求受保护的Demo API：
  const config = {
    method: 'get',
    url,
    headers: {
      'Authorization': id_token
    },
        
  };
  $.ajax(config).done(function(data) {
    console.log('Success: request to API Gateway ');
    $resultArea.text(JSON.stringify(data, undefined, 4));
  }).fail(function(xhr, textStatus, errorThrown ) {
    $resultArea.text(errorThrown);
  });
}

const loginStatus = () => {
  console.log('Start reqeust to demo api');
  const id_token = sessionStorage.getItem(NAME_ID_TOKEN);

  showApiResult(auth_via_lambda_api_url, id_token, $('#responseText'));
  showApiResult(auth_via_oidc_api_url, id_token, $('textarea[name="auth-via-oidc-res"]'));
  //访问AWS资源
  console.log('Start reqeust to AWS resources');
  // Initialize the Amazon Cognito credentials provider
  AWS.config.region = region; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: aws_identity_pool_id,
    Logins: {
      [authing_oidc_issue_suffix]: id_token
    }
  });

  AWS.config.credentials.get(function(err/*, cred*/) {
    if (!err) {
      console.log(AWS.config.credentials);
      console.log('retrieved identity: ' + AWS.config.credentials.identityId);
      awsCredentialsPromise.resolve();
            
    } else {
      console.error('error retrieving identity:' + err);
      alert('error retrieving identity: ' + err);
    }
  });


  $('body').removeClass('not-logined').addClass('has-logined');
  $('#tokenText').html(sessionStorage.getItem(NAME_ID_TOKEN));
  $('#bodyText').val('{}');
  $('#urlText').val(auth_via_lambda_api_url);
  $('input[name="auth-via-oidc-api"]').val(auth_via_oidc_api_url);
};

const logoutStatus = () => {
  sessionStorage.removeItem(NAME_ID_TOKEN);
  $('body').removeClass('has-logined').addClass('not-logined');
};


$(document).ready(function() {
  if (id_token) {
    console.log('Get id_token: ' + id_token);
    sessionStorage.setItem(NAME_ID_TOKEN, id_token);
    loginStatus();
    if (location.hash) {
      location.hash = '';
    }
  } else {
    console.log('no id_token!');
    logoutStatus();
  }
  $('#login-btn').click(function() {
    console.log('Start login');
    location.href = authing_oidc_login_url;
  });
    
  $('#logout-btn').click(function() {
    console.log('Start logout');
    location.href = authing_oidc_logout_url;
  });
  $('button[name="s3-get-object"]').click(function() {
    awsCredentialsPromise.then(function() {
      // Create S3 service object
      const s3 = new AWS.S3({apiVersion: '2006-03-01'});

      // Call S3 to list the buckets
      s3.getObject({
        Bucket: aws_bucket_name_test,
        Key: $('input[name="s3-filename"]').val() || 'LICENSE'
      },function(err, data) {
        if (err) {
          console.log('getObject Error', err);
        } else {
          console.log('getObject Success', data);
          $('#s3-response').text(JSON.stringify(data));
        }
      });
    });
        
  });
});