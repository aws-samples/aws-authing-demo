const app_domian = `${app_name}.authing.cn`;
const authing_oidc_issue_suffix = `${app_domian}/oidc`;
const authing_oidc_issue = `https://${authing_oidc_issue_suffix}`;
const authing_oidc_login_url = `https://${app_domian}/oidc/auth?client_id=${app_id}&redirect_uri=${sp_redirect_url}&scope=openid profile&response_type=id_token token&state=jazz&nonce=1831289`;

const authing_oidc_logout_url = `https://${app_domian}/oidc/session/end?app_id=${app_id}&redirect_uri=${sp_redirect_url}`;
const aws_domain = region.startsWith('cn-') ? 'amazonaws.com.cn' : 'amazonaws.com'
const protected_api_url = `https://${aws_api_id}.execute-api.${region}.${aws_domain}/Prod/info`;
const awsCredentialsPromise = $.Deferred();
$("#login-btn").click(async function () {
    console.log("Start login");
    location.href = authing_oidc_login_url;
});

$("#logout-btn").click(async function () {
    console.log("Start logout");
    location.href = authing_oidc_logout_url;
});

const loginStatus = () => {
    console.log('Start reqeust to demo api')
    let id_token = sessionStorage.getItem('id_token')

    //请求受保护的Demo API：
    config = {
        method: 'get',
        url: protected_api_url,
        headers: {
            'Authorization': id_token
        },
        
    }
    $.ajax(config).done(function(data) {
        console.log('Success: request to API Gateway ')
        $("#responseText").html(JSON.stringify(data, undefined, 4));
    }).fail(function(xhr, textStatus, errorThrown ) {
        $("#responseText").html(errorThrown);
    });

    //访问AWS资源
    console.log('Start reqeust to AWS resources')
    // Initialize the Amazon Cognito credentials provider
    AWS.config.region = region; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: aws_identity_pool_id,
        Logins: {
            [authing_oidc_issue_suffix]: id_token
        }
    });

    AWS.config.credentials.get(function (err, cred) {
        if (!err) {
            console.log(AWS.config.credentials);
            console.log('retrieved identity: ' + AWS.config.credentials.identityId);
            awsCredentialsPromise.resolve();
            
        } else {
            console.error('error retrieving identity:' + err);
            alert('error retrieving identity: ' + err);
        }
    });


    $('#demoDiv').show();
    $('#headerDiv').show();
    $('#footerDiv').show();
    $('#logout-btn').show();
    $('#login-btn').hide();
    $('#frontDiv').hide();
    $('#tokenText').html(sessionStorage.getItem('id_token'));
    $('#bodyText').val('{}');
    $('#urlText').val(protected_api_url);

}

const logoutStatus = () => {
    $('#demoDiv').hide();
    $('#headerDiv').hide();
    $('#footerDiv').hide();
    $('#logout-btn').hide();
    $('#login-btn').show();
    $('#frontDiv').show();

}

const queryString = window.location.hash.substring(1)
console.log(queryString)

const urlParams = new URLSearchParams(queryString);

const id_token = urlParams.get("id_token")

if (id_token) {
    console.log('Get id_token: ' + id_token);
    sessionStorage.setItem('id_token', id_token);
    loginStatus()
    if (location.hash) {
        location.hash = '';
        // history.replaceState('', '', '/');
    }
}
else {
    console.log('no id_token!');
    logoutStatus();
}

$(document).ready(function() {
    $('button[name="s3-get-object"]').click(function() {
        awsCredentialsPromise.then(function() {
            // Create S3 service object
            const s3 = new AWS.S3({apiVersion: '2006-03-01'});

            // Call S3 to list the buckets
            s3.getObject({
                Bucket: aws_bucket_name_test,
                Key: 'LICENSE'
            },function(err, data) {
                if (err) {
                    console.log("getObject Error", err);
                } else {
                    console.log("getObject Success", data);
                    $('#s3-response').text(JSON.stringify(data));
                }
            });
        });
        
    });
});