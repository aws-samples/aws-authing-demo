/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * This is a token-based Lambda Authorizer for API Gateway which is used to verify token from Authing.cn, 
 * based on the sample from Lambda documentation:
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
 * @author Randy Lin
 */
   
const jwt = require('jsonwebtoken');
const jose = require('jose')

exports.lambdaHandler =  function(event, context, callback) {
    //console.log(event);
    //console.log(context);
    var token = event.authorizationToken;
    //console.log(token);
    
    try {
        //Authing id token验证机制详见如下链接：
        //https://docs.authing.cn/authing/authentication/oidc/oidc-authorization#05-yan-zheng-accesstoken-he-idtoken-de-he-fa-xing

        //签名算法的选择：
        //如果需要与Cognito Identity Pool集成，则需要使用RS256算法，否则可以使用HS356算法，较为简化

        //针对使用HS256做为签名算法的 id token 验证： 
        //从Authing.cn控制台获取OIDC应用的App Secret并存入在Lambda环境变量中
        //const app_secret = process.env.Authing_App_Secret;
        //const decoded = jwt.verify(token, app_secret); 

        //针对使用RS256做为签名算法的 id token 验证: 

        //如果使用Authing的默认密钥进行签名，则需要用Authing对应的公钥进行签名验证
        //具体可查阅：https://docs.authing.cn/authing/authentication/oidc/oidc-authorization
        //pubkey = fs.readFileSync('authing_pubkey.pem')

        //如果使用自定的签名密钥，则在下方填入密钥（如下是示例应用的自定义签名密钥）
        let key =  jose.JWK.asKey({
          "n": "yycWRajkICDa2gJwXkeTug7MKhsP1CC-GQxljSw2ACE3MefE0Bsusoesik9DJP2yve8TmC1vo2Jqu02vTUhy2RWZOCLDInLbt2kHVW_LC-BmoktoMIkPkaBZIsRLPakqMp3CroR_thQ7hKTTle8S9i5PI49CEeUx4ANsfuawp7gW_sKCdR0VVCXwcGZvN7CDcYfHPse_7tn_PfoGSqzUHnglhnbIEHxd6ZgPdUW3KNshFzM78j7iCy0bGi-WGUM30CG0CBWXMNX2ZAC4q_LfVSpdnAHAzCS6AcAnzqtoKi7xdNuKtLCNfCB_0uE-TUGx0nPrlQ3g3HPgfPRP8C9NQw",
          "e": "AQAB",
          "use": "sig",
          "alg": "RS256",
          "kid": "xUhDE3A3FiCOtsxuS5K7WOBhiJKabB3ut-rWDu_l15E",
          "kty": "RSA"
        });
        pubkey = key.toPEM();

        console.log('RSA Pubkey: ' + pubkey);
        const decoded = jwt.verify(token, pubkey, { algorithms: ['RS256'] });

        console.log('expired: ' + decoded.exp)
        console.log('current: ' + Date.parse(new Date()) / 1000)
        //比较token expired时间
        const expired = (Date.parse(new Date()) / 1000) > decoded.exp        
        
        //针对原来使用Cognito User Pool的方案，需要迁移至Authing的时候：
        //可以通过自定义回复来模拟RequestContext中与Cognito相关的值，从而减少代码修改量:
        //一般来说使用Cognito的代码中会通过claims来获取Cognito用户名或id等
        //请参考： https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html
        // const claims = {
        //         "cognito:username": decoded.username
        // }

        
      if (expired) {
        //Token过期
        callback("Error: Token Expired");
      }else {
        // 合法也没过期，正常放行
        console.log("Valid token.");

        //如果使用自定义回复：
        //callback(null, generatePolicy('user', 'Allow', event.methodArn, claims));

        //如果不使用自定义回复
        callback(null, generatePolicy('user', 'Allow', event.methodArn));
      }
    } catch (error) {
        //其他异常
        console.log(error);
        callback("Error: Invalid token"); // Return a 500 Invalid token response
    }
};

// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource, claims) {
    var authResponse = {};
    
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; 
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; 
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    
    // 以下代码用于从Cognito User Pool向Authing迁移时使用：
    // authResponse.context = {
    //     //目前自定义的context不支持直接传入JSON Object，需要先stringify，并在Lambda中parse后进行访问。
    //     "claims" : JSON.stringify(claims) 
    // };

    
    return authResponse;
}