'use strict';

const _ = require('lodash');
const assert = require('chai').assert;
const accountData = require('./../data/account.json');
const expect = require('chai').expect;
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');

describe('Accounts', function testAccounts() {
  const accounts = [];

  after('Clean Data', function () {
    return common.populate.account.clean();
  });

  describe('POST', function () {
    const url = endpoints.account.post;
    const omittedField = ['sid', 'editDate', 'createdDate'];

    it('Should Add account successfully and return 200 response', function () {
      const payload = _.cloneDeep(accountData.post.payload.valid);

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          accounts.push(result);

          expect(_.omit(result, omittedField)).to.eql(payload);
        });

    });

    it('Should Add account successfully without [externalId] and return 200 response', function () {
      const payload = _.omit(accountData.post.payload.valid, 'externalId');

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          accounts.push(result);

          expect(_.omit(result, omittedField)).to.eql(_.merge(payload, {externalId: null}));
        });

    });

    it('Should Add account successfully with same [externalId] and return 200 response', function () {
      const payload = _.cloneDeep(accountData.post.payload.valid);

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          accounts.push(result);

          expect(_.omit(result, omittedField)).to.eql(payload);
        });

    });

    it('Should fail to add for database failure and return 400 response', function () {
      const payload = _.cloneDeep(accountData.post.payload.valid);
      const request = common.request.post(url).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'addData',
          name: 'account'
        });
    });
  });

  describe('LIST', function () {
    const urlTemplate = endpoints.account.list;

    it('Should list successfully and return 200 response', function () {

      return common
        .request
        .get(urlTemplate)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result.total).to.eql(accounts.length);
          expect(result.count).to.eql(accounts.length);
          expect(result.results).to.eql(accounts);
        });

    });

    it('Should list filtered by [limit, offset] successfully and return 200 response', function () {
      const limit = 1;
      let offset = 1;
      const url = common.buildUrl(urlTemplate, {}, {limit, offset});
      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result.total).to.eql(accounts.length);
          expect(result.count).to.eql(limit);

          for (const account of result.results) {
            expect(account).to.eql(accounts[offset++]);
          }
        });

    });

    it('Should fail to list for database failure and return 400 response', function () {
      const request = common.request.get(urlTemplate);

      return common
        .testDatabaseFailure({
          request,
          type: 'listData',
          name: 'account'
        });

    });
  });
});
