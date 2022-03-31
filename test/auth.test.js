'use strict';
const request = require('superagent');
const app = require('../lambda-authorizer/app.js');
const chai = require('chai');
const expect = chai.expect;
let authorizationToken = '';
const env = process.env;
const app_name = env.AUTHING_APP_NAME;

const authing_oidc_issue = `http://${app_name}.authing.cn/oidc`;
const token_url = authing_oidc_issue + '/token';

describe('Tests index', function() {
  before((done) => {

    request.post(token_url)
      .type('form')
      .send({
        client_id: env.AUTHING_APP_ID,
        client_secret: env.AUTHING_APP_SECRET,
        grant_type: 'password',
        username: env.AUTHING_TEST_USERNAME,
        password: env.AUTHING_TEST_PASSWORD,
        scope: 'openid profile',
        response_type: 'id_token token',
      }).end(function(err, res) {
        console.log(res.body);
        if (err) {
          return done(err);
        }

        authorizationToken =  res.body.id_token;
      });
      
    
    
  });  
  it('verifies successful response', async() => {
    const event = {
      authorizationToken
    };
    app.handler(event, {}, function(err, auth) {
      expect(err).to.be.null;
      expect(auth).to.be.an('object').to.haveOwnProperty('policyDocument');
    });    
  });
});
