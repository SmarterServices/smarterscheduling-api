'use strict';

const _ = require('lodash');
const locationData = require('./../data/location');
const expect = require('chai').expect;
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');

describe('Locations', function testAccounts() {
  let accountSid;
  let accountSid1;
  // Account Sid having 'PA' prefix
  let accountSid2;
  const externalId = common.makeGenericSid('ex');
  const locations = [];
  // Locations under 'PA' prefixed account
  const locations1 = [];

  before('PopulateData', function* () {

    accountSid = (yield common.populate.account.addDefault()).sid;
    accountSid1 = (yield common.populate.account.addDefault()).sid;
    accountSid2 = (yield common.populate.account.addDefault({
      sid: common.makeGenericSid('PA')
    })).sid;
  });

  after('Clean Data', function* () {
    yield common.populate.account.clean();
    yield common.populate.location.clean();
  });

  describe('POST', function () {
    const urlTemplate = endpoints.location.post;
    let defaultUrl;
    const omittedField = ['sid', 'lastModifiedDate', 'createdDate', 'systemModstamp', 'schedulingAccountSid'];

    before('Populate data', () => {
      defaultUrl = common.buildUrl(urlTemplate, {accountSid});
    });

    it('Should successfully add [location] with no [sid] in [payload] and return 200 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);

      return common
        .request
        .post(defaultUrl)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          locations.push(result);

          expect(_.omit(result, omittedField)).to.eql(payload);
          expect(result.schedulingAccountSid).to.eql(accountSid);
        });

    });

    it('Should successfully add [location] under [PA prefixed] [account] and return 200 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid: accountSid2});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          // Result Object is pushed in the location1 array here because of different account sid
          locations1.push(result);
          expect(_.omit(result, omittedField)).to.eql(payload);
          expect(result.schedulingAccountSid).to.eql(accountSid2);
        });

    });

    it('Should successfully add with [PL prefixed] [sid] in [payload] and return 200 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid: accountSid2});
      payload.sid = common.makeGenericSid('PL');

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          locations1.push(result);

          expect(result.sid).to.equal(payload.sid);
          expect(_.omit(result, omittedField)).to.eql(_.omit(payload, omittedField));
          expect(result.schedulingAccountSid).to.eql(accountSid2);
        });
    });

    it('Should successfully add with [SL prefixed] [sid] in [payload] and return 200 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid: accountSid2});
      payload.sid = common.makeGenericSid('SL');

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          locations1.push(result);

          expect(result.sid).to.equal(payload.sid);
          expect(_.omit(result, omittedField)).to.eql(_.omit(payload, omittedField));
          expect(result.schedulingAccountSid).to.eql(accountSid2);
        });
    });

    it('Should not add for existing [sid] in [payload] and return 200 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);
      payload.sid = locations[0].sid;

      return common
        .request
        .post(defaultUrl)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('SID_ALREADY_EXISTS', response);
        });
    });

    it('Should successfully add location without [externalId] and return 200 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);
      payload.externalId = null;

      return common
        .request
        .post(defaultUrl)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          locations.push(result);

          expect(_.omit(result, omittedField)).to.eql(payload);
          expect(result.schedulingAccountSid).to.eql(accountSid);
        });

    });

    it('Should successfully add location with different [externalId] and return 200 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);
      payload.externalId = externalId;

      return common
        .request
        .post(defaultUrl)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          locations.push(result);

          expect(_.omit(result, omittedField)).to.eql(payload);
          expect(result.schedulingAccountSid).to.eql(accountSid);
        });

    });

    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid: common.makeGenericSid('SA')});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });

    });

    it('Should fail to add for database failure and return 400 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);
      const request = common.request.post(defaultUrl).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'addData',
          name: 'location'
        });
    });

    it('Should fail to add for database failure of [getLocation] and return 400 response', function () {
      const payload = _.cloneDeep(locationData.post.payload.valid);
      payload.sid = locations[0].sid;
      const request = common.request.post(defaultUrl).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'getData',
          name: 'location'
        });
    });
  });

  describe('LIST', function () {
    const urlTemplate = endpoints.location.list;
    let defaultUrl;

    before('Populate data', () => {
      defaultUrl = common.buildUrl(urlTemplate, {accountSid});
    });

    it('Should list successfully and return 200 response', function () {

      return common
        .request
        .get(defaultUrl)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result.total).to.eql(locations.length);
          expect(result.count).to.eql(locations.length);
          expect(result.results).to.eql(locations);
        });

    });

    it('Should list for [PA prefixed] [account] and return 200 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid: accountSid2
      });

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result.total).to.eql(locations1.length);
          expect(result.count).to.eql(locations1.length);
          expect(result.results).to.eql(locations1);
        });

    });

    it('Should return empty response for different [accountSid] with 200 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid: accountSid1});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result.total).to.eql(0);
          expect(result.count).to.eql(0);
        });

    });

    it('Should filter by [externalId] and return successfully with 200 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid}, {externalId});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result.total).to.eql(1);
          expect(result.count).to.eql(1);
          expect(result.results[0].externalId).to.eql(externalId);
        });

    });

    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid: common.makeGenericSid('SA')});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });

    });

    it('Should list filtered by [limit, offset] successfully and return 200 response', function () {
      const limit = 1;
      let offset = 1;
      const url = common.buildUrl(urlTemplate, {accountSid}, {limit, offset});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.verifyPagination(response);
          const result = response.result;
          expect(result.total).to.eql(locations.length);
          expect(result.count).to.eql(limit);

          for (const location of result.results) {
            expect(location).to.eql(locations [offset++]);
          }
        });

    });

    it('Should fail to list for database failure and return 400 response', function () {
      const request = common.request.get(defaultUrl);

      return common
        .testDatabaseFailure({
          request,
          type: 'listData',
          name: 'location'
        });

    });
  });
});
