'use strict';

const _ = require('lodash');
const moment = require('moment');
const exclusionData = require('./../data/exclusion.json');
const expect = require('chai').expect;
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');

describe('Exclusions', function testAccounts() {
  let accountSid;
  let accountSid2;
  let locationSid;
  let scheduleSid;
  const exclusions = [];

  before('PopulateData', function* () {

    accountSid = (yield common.populate.account.addDefault()).sid;
    accountSid2 = (yield common.populate.account.addDefault()).sid;
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
      yield common.populate.location.update({schedulingAccountSid: common.makeGenericSid('SA')}, {sid: locationSid});

      yield common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND', response);
        });

      //revert changes
      yield common.populate.location.update({schedulingAccountSid: accountSid}, {sid: locationSid});
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

  describe('GET Details', function () {
    let exclusionSid;
    const urlTemplate = endpoints.exclusion.get;

    before('Init', () => {
      exclusionSid = exclusions[0].sid;
    });

    it('Should get exclusion details for valid [accountSid] and [exclusionSid] with 200 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid, exclusionSid});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.equal(200);
          expect(result).to.eql(exclusions[0]);
        });

    });


    it('Should fail for invalid [exclusionSid] with 404 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid, exclusionSid: common.makeGenericSid('AE')});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('EXCLUSION_NOT_FOUND_UNDER_ACCOUNT', response);
        });

    });


    it('Should fail for invalid [accountSid] with 404 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid: common.makeGenericSid('SA'), exclusionSid});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });

    });


    it('Should fail for different [accountSid] with 404 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid: accountSid2, exclusionSid});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('EXCLUSION_NOT_FOUND_UNDER_ACCOUNT', response);
        });

    });
  });


  describe('LIST', function () {
    const urlTemplate = endpoints.exclusion.list;

    it('Should list successfully and return 200 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(exclusions.length);
          expect(result.count).to.eql(exclusions.length);
          expect(result.results).to.eql(exclusions);
        });
    });

    it('Should list filtered by [limit, offset]  and return 200 response', function () {
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
          expect(result.total).to.eql(exclusions.length);
          expect(result.count).to.eql(limit);

          for (const exclusion of result.results) {
            expect(exclusion).to.eql(exclusions[offset++]);
          }
        });
    });

    it('Should list filtered by [locationSid] and return 200 response', function () {
      const locationFilteredExclusion = exclusions.filter((exclusion) => exclusion.locationSid === locationSid);

      const url = common.buildUrl(urlTemplate, {accountSid}, {locationSid});
      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(locationFilteredExclusion.length);
          expect(result.count).to.eql(locationFilteredExclusion.length);
          expect(result.results).to.eql(locationFilteredExclusion);
        });
    });

    it('Should list filtered by [scheduleSid] and return 200 response', function () {
      const scheduleFilteredExclusion = exclusions.filter((exclusion) => exclusion.scheduleSid === scheduleSid);

      const url = common.buildUrl(urlTemplate, {accountSid}, {scheduleSid});
      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(scheduleFilteredExclusion.length);
          expect(result.count).to.eql(scheduleFilteredExclusion.length);
          expect(result.results).to.eql(scheduleFilteredExclusion);
        });
    });

    it('Should list zero row for different [accountSid] and return 200 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid: accountSid2
      });
      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(0);
          expect(result.count).to.eql(0);
          expect(result.results).to.eql([]);
        });
    });

    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid: common.makeGenericSid('SA')
      });
      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });

    it('Should fail to list for database failure and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      const request = common.request.get(url);

      return common
        .testDatabaseFailure({
          request,
          type: 'listData',
          name: 'exclusion'
        });

    });
  });


  describe('Update', function () {
    let exclusionSid;
    const urlTemplate = endpoints.exclusion.update;

    before('Init', () => {
      exclusionSid = exclusions[0].sid;
    });

    it('Should update exclusion details for valid [accountSid] and [exclusionSid] with 200 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid, exclusionSid});
      const payload = _.cloneDeep(exclusionData.update.payload.valid);
      const fieldsToIgnore = ['editDate'];

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          const updatePayload = Object.assign({}, exclusions[0], payload);

          expect(response.statusCode).to.equal(200);
          expect(_.omit(result, fieldsToIgnore)).to.eql(_.omit(updatePayload, fieldsToIgnore));
        });

    });


    it('Should fail for invalid [exclusionSid] with 404 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid, exclusionSid: common.makeGenericSid('AE')});
      const payload = _.cloneDeep(exclusionData.update.payload.valid);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('EXCLUSION_NOT_FOUND_UNDER_ACCOUNT', response);
        });

    });


    it('Should fail for invalid [accountSid] with 404 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid: common.makeGenericSid('SA'), exclusionSid});
      const payload = _.cloneDeep(exclusionData.update.payload.valid);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });

    });


    it('Should fail for different [accountSid] with 404 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid: accountSid2, exclusionSid});
      const payload = _.cloneDeep(exclusionData.update.payload.valid);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('EXCLUSION_NOT_FOUND_UNDER_ACCOUNT', response);
        });

    });


    it('Should fail for database failure of [add exclusion] and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid, exclusionSid});
      const payload = _.cloneDeep(exclusionData.update.payload.valid);
      const request = common
        .request
        .put(url)
        .send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'updateData',
          name: 'exclusion'
        });

    });


    it('Should fail for database failure of [get exclusion] and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid, exclusionSid});
      const payload = _.cloneDeep(exclusionData.update.payload.valid);
      const request = common
        .request
        .put(url)
        .send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'getData',
          name: 'exclusion'
        });

    });
  });

  describe('DELETE', function () {
    const urlTemplate = endpoints.exclusion.update;

    it('Should delete successfully with 200 response', function* () {
      const exclusionSid = exclusions[0].sid;
      const url = common.buildUrl(urlTemplate, {accountSid, exclusionSid});

      const listBeforeDelete = yield common.populate.exclusion.list();

      yield common
        .request
        .delete(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.equal(200);
          expect(result).to.eql({success: 'OK'});
        });

      //check that correct row has been deleted
      const listAfterDelete = yield common.populate.exclusion.list();
      expect(listAfterDelete.length).to.eql(listBeforeDelete.length - 1);

      for(const exclusion of listAfterDelete) {
        expect(exclusion.sid).to.not.eql(exclusionSid);
      }
    });

    it('Should fail to delete already deleted row and return 404 response', function () {
      const exclusionSid = exclusions[0].sid;
      const url = common.buildUrl(urlTemplate, {accountSid, exclusionSid});

      return common
        .request
        .delete(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('EXCLUSION_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const exclusionSid = exclusions[1].sid;
      const url = common.buildUrl(urlTemplate, {
        exclusionSid,
        accountSid: common.makeGenericSid('SA')
      });

      return common
        .request
        .delete(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });

    it('Should fail for invalid [exclusionSid] and return 404 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid,
        exclusionSid: common.makeGenericSid('AE')
      });

      return common
        .request
        .delete(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('EXCLUSION_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for [exclusionSid] under different [accountSid] and return 404 response', function () {
      const exclusionSid = exclusions[1].sid;

      const url = common.buildUrl(urlTemplate, {
        exclusionSid,
        accountSid: accountSid2
      });

      return common
        .request
        .delete(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('EXCLUSION_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for database failure of [delete exclusion] and return 400 response', function () {
      const exclusionSid = exclusions[1].sid;

      const url = common.buildUrl(urlTemplate, {accountSid, exclusionSid});
      const request = common.request.delete(url);

      return common
        .testDatabaseFailure({
          request,
          type: 'deleteData',
          name: 'exclusion'
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
