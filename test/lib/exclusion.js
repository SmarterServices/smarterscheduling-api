'use strict';

const _ = require('lodash');
const moment = require('moment');
const exclusionData = require('./../data/exclusion.json');
const expect = require('chai').expect;
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');

describe('Exclusions', function testAccounts() {
  let accountSid;
  let locationSid;
  let scheduleSid;
  const exclusions = [];

  before('PopulateData', function* () {

    accountSid = (yield common.populate.account.addDefault()).sid;
    locationSid = (yield common.populate.location.addDefault({schedulingAccountSid: accountSid})).sid;

    const schedule = yield common.populate.schedule.addDefault({});
    scheduleSid = schedule.sid;
  });

  after('Clean Data', function* () {
    yield common.populate.account.clean();
    yield common.populate.exclusion.clean();
    yield common.populate.location.clean();
    yield common.populate.schedule.clean();
  });

  describe('POST', function () {
    const urlTemplate = endpoints.exclusion.post;

    it('Should Add exclusion successfully and return 200 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          exclusions.push(result);
          assertAddedData(result, payload, {accountSid});
        });

    });

    it('Should Add exclusion with [locationSid] successfully and return 200 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      payload.locationSid = locationSid;
      const url = common.buildUrl(urlTemplate, {accountSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          exclusions.push(result);
          assertAddedData(result, payload, {accountSid});
        });

    });

    it('Should Add exclusion with [scheduleSid] successfully and return 200 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      payload.scheduleSid = scheduleSid;
      const url = common.buildUrl(urlTemplate, {accountSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          exclusions.push(result);
          assertAddedData(result, payload, {accountSid});
        });

    });

    it('Should Add exclusion without [endDate] successfully and return 200 response', function* () {
      const payload = _.omit(exclusionData.post.payload.valid, 'endDate');
      const url = common.buildUrl(urlTemplate, {accountSid});
      let exclusionSid;

      yield common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          exclusions.push(result);
          exclusionSid = result.sid;
          assertAddedData(result, payload, {
            accountSid,
            endDate: null
          });
        });

      const defaultEndDate = '2070-01-01';
      const addedExclusion = (yield common.populate.exclusion.list({sid: exclusionSid}))[0];
      expect(addedExclusion.endDate).to.eql(defaultEndDate);
    });

    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {
        accountSid: common.makeGenericSid('SA')
      });

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });

    it('Should fail for invalid [locationSid] and return 404 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid});
      payload.locationSid = common.makeGenericSid('SL');

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND', response);
        });
    });

    it('Should fail for [locationSid] under different [accountSid] and return 404 response', function* () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid});
      payload.locationSid = locationSid;

      //update location with a different account
      yield common.populate.location.update({schedulingAccountSid: common.makeGenericSid('SA')},{sid: locationSid});

      yield common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND', response);
        });

      //revert changes
      yield common.populate.location.update({schedulingAccountSid: accountSid},{sid: locationSid});
    });

    it('Should fail for invalid [scheduleSid] and return 404 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid});
      payload.scheduleSid = common.makeGenericSid('SC');


      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('SCHEDULE_NOT_FOUND', response);
        });
    });

    it('Should fail for [endDate] before [startDate] and return 400 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid});
      payload.endDate = moment(payload.startDate).subtract(1, 'day').format('L');

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(400);
          expect(result.status).to.eql(400);
          expect(result.code).to.eql(errorResponse.ERROR_LIST.JOI.NOT_LISTED.code);
        });
    });

    it('Should fail for [endTime] before [startTime] and return 400 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid});
      payload.startTime = '20:12';
      payload.endTime = '10:12';

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(400);
          expect(result.status).to.eql(400);
          expect(result.code).to.eql(errorResponse.ERROR_LIST.JOI.NOT_LISTED.code);
        });
    });

    it('Should fail to add exclusion for database failure and return 400 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {accountSid});
      const request = common.request.post(url).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'addData',
          name: 'exclusion'
        });
    });

    it('Should fail to get location for database failure and return 400 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      payload.locationSid = locationSid;
      const url = common.buildUrl(urlTemplate, {accountSid});
      const request = common.request.post(url).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'getData',
          name: 'location'
        });
    });

    it('Should fail to get schedule for database failure and return 400 response', function () {
      const payload = _.cloneDeep(exclusionData.post.payload.valid);
      payload.scheduleSid = scheduleSid;
      const url = common.buildUrl(urlTemplate, {accountSid});
      const request = common.request.post(url).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'getData',
          name: 'schedule'
        });
    });
  });
});

/**
 * Asserts added data with payload
 * @param {Object} result - Result object
 * @param {Object} source - Payload
 * @param {Object} additionalPayload - Any additional payload that needs to be merged on payload
 */
function assertAddedData(result, source, additionalPayload = {}) {
  const omittedField = ['createdDate', 'editDate', 'sid'];

  expect(_.omit(result, omittedField)).to.eql(_.merge(source, additionalPayload));
}
