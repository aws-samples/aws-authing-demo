const app = require('../protected-api/app.js');
const chai = require('chai');
const expect = chai.expect;
const IP = '127.0.0.1';

describe('Tests index', function() {
  it('verifies successful response', async() => {
    const event = {
      requestContext: {
        identity: {
          sourceIp: IP
        }
      }
    };
    const result = await app.handler(event, {});

    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an('string');

    let response = JSON.parse(result.body);

    expect(response).to.be.an('object');
    expect(response.message).to.be.equal('You\'re authorized. Source IP:  ' + IP);
  });
});
