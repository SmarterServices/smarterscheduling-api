'use strict';

const _ = require('lodash');
const assert = require('chai').assert;
const accountData = require('./../data/account.json');
const expect = require('chai').expect;
const common = require('./../common');
const SequelizeMock = require('./../mocks/sequelize');
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

      const sequelizeMock = new SequelizeMock();
      sequelizeMock.addData('account');


      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.compareDatabaseError(response);
          sequelizeMock.restore();
        });

    });
  });
});
