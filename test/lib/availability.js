'use strict';

const _ = require('lodash');
const moment = require('moment');
const availabilityData = require('./../data/availability');
const expect = require('chai').expect;
const common = require('./../common');
const {populate} = common;
const endpoints = require('./../data/endpoints.json');

describe('Availability', function testAccounts() {
  let accountSid;
  //PA prefixed account
  let accountSid1;
  let accountSid2;
  let accountSid3;
  let scheduleSid;
  let scheduleSid1;
  let scheduleSid2;
  let scheduleSid3;
  // Availabilities for PA prefixed account
  let availabilities1 = [];

  before('PopulateData', function* () {

    const addedSids = yield createAccountAndSchedule();
    accountSid = addedSids.accountSid;
    scheduleSid = addedSids.scheduleSid;

    const addedSids1 = yield createAccountAndSchedule('PA');
    accountSid1 = addedSids1.accountSid;
    scheduleSid1 = addedSids1.scheduleSid;

    const addedSids2 = yield createAccountAndSchedule();
    accountSid2 = addedSids2.accountSid;
    scheduleSid2 = addedSids2.scheduleSid;

    const addedSids3 = yield createAccountAndSchedule();
    accountSid3 = addedSids3.accountSid;
    scheduleSid3 = addedSids3.scheduleSid;
  });

  after('Clean Data', function* () {
    yield populate.account.clean();
    yield populate.calendar.clean();
    yield populate.location.clean();
    yield populate.schedule.clean();
    yield populate.availability.clean();
  });

  describe('POST', function () {
    let availabilities = [];
    const urlTemplate = endpoints.availability.post;
    const omittedField = ['sid', 'createdDate', 'editDate'];

    it('Should Add availability successfully and return 200 response', function () {
      const payload = getPayload(['create']);
      payload.create.push(payload.create[0]);

      setDynamicDate(payload.create);
      const url = common.buildUrl(urlTemplate, {accountSid, scheduleSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          const availabilityList = result.results;
          availabilities = availabilityList;

          expect(availabilityList.length).to.eql(2);
          for (let index = 0; index < availabilityList.length; index++) {
            assertSuccessResponse(availabilityList[index], payload.create[index], {scheduleSid});
          }
        });
    });

    it('Should Add availability for [PA prefixed] [account] and return 200 response', function () {
      const payload = getPayload(['create']);
      payload.create.push(payload.create[0]);

      setDynamicDate(payload.create);
      const url = common.buildUrl(urlTemplate, {
        accountSid: accountSid1,
        scheduleSid: scheduleSid1
      });

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          const availabilityList = result.results;
          availabilities1 = availabilityList;

          expect(availabilityList.length).to.eql(2);
          for (let index = 0; index < availabilityList.length; index++) {
            assertSuccessResponse(availabilityList[index], payload.create[index], {scheduleSid: scheduleSid1});
          }
        });
    });

    it('Should update availability successfully and return 200 response', function () {
      const payload = getPayload(['create', 'update']);

      setDynamicDate(payload.update);
      setDynamicDate(payload.create);
      const availabilitySid = availabilities[0].sid;
      payload.update[0].sid = availabilitySid;
      const url = common.buildUrl(urlTemplate, {accountSid, scheduleSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          const availabilityList = result.results;
          availabilities = result.results;

          expect(availabilityList.length).to.eql(3);
          for (let index = 0; index < availabilityList.length; index++) {
            let source;

            if (availabilityList[index].sid === availabilitySid) {
              source = _.omit(payload.update[0], 'sid');
              source.startTime = source.startTime + ':00';
              source.endTime = source.endTime + ':00';
            } else {
              source = Object.assign({}, availabilityData.post.valid.payload.create[0], {
                startDate: availabilities[0].startDate,
                endDate: availabilities[0].endDate
              });
            }

            assertSuccessResponse(availabilityList[index], source, {scheduleSid});
          }
        });
    });

    it('Should delete availability successfully and return 200 response', function () {
      const payload = getPayload(['delete']);

      const availabilitySid1 = availabilities[0].sid;
      const availabilitySid2 = availabilities[1].sid;

      payload.delete[0].sid = availabilitySid1;
      payload.delete.push(Object.assign({}, payload.delete[0], {sid: availabilitySid2}));

      const url = common.buildUrl(urlTemplate, {accountSid, scheduleSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          const availabilityList = result.results;
          expect(availabilityList.length).to.be.at.least(1);
          expect(availabilityList.length).to.eql(availabilities.length - 2);
          for (const availability of availabilityList) {
            expect(availability.sid).to.not.eql(availabilitySid1);
            expect(availability.sid).to.not.eql(availabilitySid2);
          }
          availabilities = availabilityList;
        });
    });

    it('Should set default [endDate, recurring] when not passed and return 200 response', function () {
      const payload = getPayload(['create', 'update']);
      payload.update[0].sid = availabilities[0].sid;

      //remove endDate and recurring from payload
      payload.create = payload.create.map((item) => {
        return _.omit(item, 'endDate', 'recurring');
      });

      payload.update = payload.update.map((item) => {
        return _.omit(item, 'endDate', 'recurring');
      });


      const url = common.buildUrl(urlTemplate, {accountSid, scheduleSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          const availabilityList = result.results;
          expect(availabilityList.length).to.be.at.least(2);
          availabilities = result.results;

          for (const availability of availabilityList) {
            expect(availability.endDate).to.eql(null);
            expect(availability.recurring).to.eql('weekly');
          }

        });
    });

    it('Should list under specific [scheduleSid] after crud and return 200 response', function* () {
      const payload = getPayload(['create']);
      setDynamicDate(payload.create);

      const availabilitySid = availabilities[0].sid;

      //update availability to have a different schedule
      yield populate.availability.update({scheduleSid: common.makeGenericSid('SC')}, {sid: availabilitySid});

      const url = common.buildUrl(urlTemplate, {accountSid, scheduleSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          availabilities = result.results;

          for (const availability of availabilities) {
            expect(availability.sid).to.not.eql(availabilitySid);
          }
        });
    });

    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const payload = getPayload();
      payload.update[0].sid = availabilities[0].sid;
      payload.delete[0].sid = availabilities[0].sid;

      const url = common.buildUrl(urlTemplate, {
        scheduleSid,
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

    it('Should fail for invalid [scheduleSid] and return 404 response', function () {
      const payload = getPayload();
      payload.update[0].sid = availabilities[0].sid;
      payload.delete[0].sid = availabilities[0].sid;

      const url = common.buildUrl(urlTemplate, {
        accountSid,
        scheduleSid: common.makeGenericSid('SC')
      });

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('SCHEDULE_NOT_FOUND', response);
        });
    });

    it('Should fail for [scheduleSid] under different [accountSid] and return 404 response', function () {
      const payload = getPayload();
      payload.update[0].sid = availabilities[0].sid;
      payload.delete[0].sid = availabilities[0].sid;

      const url = common.buildUrl(urlTemplate, {
        scheduleSid,
        accountSid: accountSid2
      });

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('SCHEDULE_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for invalid [availabilitySid] return 404 response', function () {
      const payload = getPayload();
      payload.update[0].sid = common.makeGenericSid('AV');
      payload.delete[0].sid = common.makeGenericSid('AV');

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('AVAILABILITY_LIST_NOT_FOUND', response);
        });
    });

    it('Should fail for [availabilitySid] under different [scheduleSid] and return 404 response', function* () {
      const payload = getPayload(['delete']);
      const availabilitySid = availabilities[0].sid;
      payload.delete[0].sid = availabilitySid;

      //modify the availability to have a different schedule
      yield populate.availability.update({scheduleSid: common.makeGenericSid('SC')}, {sid: availabilitySid});

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

      yield common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('AVAILABILITY_LIST_NOT_FOUND', response);
        });

      //revert changes
      yield populate.availability.update({scheduleSid}, {sid: availabilitySid});
    });

    it('Should fail for [endDate] before [startDate] while creating availability and return 400 response', function () {
      const payload = getPayload(['create']);
      payload.create[0].startDate = moment().format('YYYY-MM-DD');
      payload.create[0].endDate = moment(payload.create[0].startDate).subtract(1, 'day').format('YYYY-MM-DD');

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

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

    it('Should fail for [endDate] before [startDate] while updating availability and return 400 response', function () {
      const payload = getPayload(['update']);

      payload.update[0].sid = availabilities[0].sid;
      payload.update[0].startDate = moment().format('YYYY-MM-DD');
      payload.update[0].endDate = moment(payload.update[0].startDate).subtract(1, 'day').format('YYYY-MM-DD');

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

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

    it('Should fail for [endTime] before [startTime] while creating availability and return 400 response', function () {
      const payload = getPayload(['create']);

      payload.create[0].startTime = '20:15';
      payload.create[0].endDate = '10:15';

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

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

    it('Should fail for [endTime] before [startTime] while updating availability and return 400 response', function () {
      const payload = getPayload(['update']);

      payload.update[0].sid = availabilities[0].sid;

      payload.update[0].startTime = '20:15';
      payload.update[0].endDate = '10:15';

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

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

    it('Should fail for database failure of [validateScheduleAndAccount] and return 400 response', function () {
      const payload = getPayload();
      payload.update[0].sid = availabilities[0].sid;
      payload.delete[0].sid = availabilities[0].sid;

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

      const apiRequest = common.request.post(url).send(payload);

      return common
        .testDatabaseFailure({
          request: apiRequest,
          type: 'rawQuery',
          name: 'validateScheduleAndAccount',
          fileNamePattern: /.*services[\\\/]schedule\.js/
        });
    });

    it('Should fail for database failure of [bulkcreate availability] and return 400 response', function* () {
      const payload = getPayload();
      payload.update[0].sid = availabilities[0].sid;
      payload.delete[0].sid = availabilities[1].sid;

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

      const apiRequest = common.request.post(url).send(payload);

      const availabilityBeforeRequest = yield populate.availability.list({scheduleSid});

      yield common
        .testDatabaseFailure({
          request: apiRequest,
          type: 'bulkCreate',
          name: 'availability'
        });

      const availabilityAfterRequest = yield populate.availability.list({scheduleSid});
      expect(availabilityBeforeRequest).to.have.deep.members(availabilityAfterRequest);
    });

    it('Should fail for database failure of [batch update availability] and return 400 response', function* () {
      const payload = getPayload(['create', 'update']);
      payload.update[0].sid = availabilities[0].sid;

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

      const availabilityBeforeRequest = yield populate.availability.list({scheduleSid});

      const apiRequest = common.request.post(url).send(payload);

      yield common
        .testDatabaseFailure({
          request: apiRequest,
          type: 'rawQuery',
          name: 'batchUpdateAvailability',
          fileNamePattern: /.*services[\\\/]availability\.js/
        });

      const availabilityAfterRequest = yield populate.availability.list({scheduleSid});
      expect(availabilityBeforeRequest).to.have.deep.members(availabilityAfterRequest);
    });

    it('Should fail for database failure of [batch delete availability] and return 400 response', function* () {
      const payload = getPayload(['create', 'delete']);
      payload.delete[0].sid = availabilities[0].sid;

      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

      const availabilityBeforeRequest = yield populate.availability.list({scheduleSid});

      const apiRequest = common.request.post(url).send(payload);

      yield common
        .testDatabaseFailure({
          request: apiRequest,
          type: 'deleteData',
          name: 'availability'
        });

      const availabilityAfterRequest = yield populate.availability.list({scheduleSid});
      expect(availabilityBeforeRequest).to.have.deep.members(availabilityAfterRequest);
    });


    /**
     * Sets dynamic startDate and endDate to payload
     * @param {Array<Object>} payload - List of availability
     */
    function setDynamicDate(payload) {
      payload.forEach((availability) => {
        availability.startDate = moment().format('YYYY-MM-DD');
        availability.endDate = moment().add(1, 'day').format('YYYY-MM-DD');
      });
    }

    /**
     * Asserts success response
     * @param {Object} result - Availability
     * @param {Object} source - Payload that has been added
     * @param {Object} [additionalField] - Any additional field that needs to be merged into source
     */
    function assertSuccessResponse(result, source, additionalField = {}) {
      const payload = Object.assign({}, source, additionalField);
      expect(_.omit(result, omittedField)).to.eql(payload);
    }

    /**
     * Returns payload for given property
     * @param {Array<string>} operationsToPick - Name of the operations to pick
     * @returns {Object} - Payload to request with
     */
    function getPayload(operationsToPick = ['create', 'update', 'delete']) {
      let payload = _.cloneDeep(availabilityData.post.valid.payload);
      payload = _.pick(payload, operationsToPick);
      return payload;
    }

  });

  describe('LIST', function () {
    const urlTemplate = endpoints.availability.list;
    const availabilities = [];
    before('PopulateData', function* () {
      const availability = yield createAvailability(scheduleSid2);
      availabilities.push(availability);
      const availability1 = yield createAvailability(scheduleSid1);
      availabilities1.push(availability1);
      const availability2 = yield createAvailability(scheduleSid2);
      availabilities.push(availability2);
      const availability3 = yield createAvailability(scheduleSid2);
      availabilities.push(availability3);
    });

    it('Should list availability successfully and return 200 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid: accountSid2,
        scheduleSid: scheduleSid2
      });

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(availabilities.length);
          expect(result.count).to.eql(availabilities.length);
          expect(result.results.length).to.eql(availabilities.length);
          expect(result.results).to.have.deep.members(availabilities);
        });
    });

    it('Should list availability for [PA prefixed] [account] and return 200 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid: accountSid1,
        scheduleSid: scheduleSid1
      });

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(availabilities1.length);
          expect(result.count).to.eql(availabilities1.length);
          expect(result.results.length).to.eql(availabilities1.length);
          expect(result.results).to.have.deep.members(availabilities1);
        });
    });

    it('Should list availability with [limit, offset] successfully and return 200 response', function () {
      const params = {
        accountSid: accountSid2,
        scheduleSid: scheduleSid2
      };
      const limit = 1;
      let offset = 1;
      const url = common.buildUrl(urlTemplate, params, {limit, offset});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.verifyPagination(response);
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(availabilities.length);
          expect(result.count).to.eql(limit);
          expect(result.results.length).to.eql(limit);

          for (const exclusion of result.results) {
            expect(exclusion).to.eql(availabilities[offset++]);
          }
        });
    });

    it('Should list zero availability for different [scheduleSid] and return 200 response', function () {
      const params = {
        accountSid: accountSid3,
        scheduleSid: scheduleSid3
      };
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(0);
          expect(result.count).to.eql(0);
          expect(result.results.length).to.eql(0);
        });
    });

    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid: common.makeGenericSid('SA'),
        scheduleSid: scheduleSid2
      });

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });

    it('Should fail for invalid [scheduleSid] and return 404 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid: accountSid2,
        scheduleSid: common.makeGenericSid('SC')
      });

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('SCHEDULE_NOT_FOUND', response);
        });
    });

    it('Should fail for [scheduleSid] under different [accountSid] and return 404 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid,
        scheduleSid: scheduleSid2
      });

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('SCHEDULE_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for database failure of [validateScheduleAndAccount] and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

      const apiRequest = common.request.get(url);

      return common
        .testDatabaseFailure({
          request: apiRequest,
          type: 'rawQuery',
          name: 'validateScheduleAndAccount',
          fileNamePattern: /.*services[\\\/]schedule\.js/
        });
    });

    it('Should fail for database failure of [list availability] and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {scheduleSid, accountSid});

      const apiRequest = common.request.get(url);

      return common
        .testDatabaseFailure({
          request: apiRequest,
          type: 'listData',
          name: 'availability'
        });
    });


    /**
     * Creates an availability and return formatted response
     * @param {string} scheduleSid - Availability will be added under this schedule
     * @returns {Object} - Formatted response
     */
    function* createAvailability(scheduleSid) {
      const omittedField = ['id', 'isDeleted', 'name', 'systemModstamp', 'schedule', 'lastModifiedDate'];
      const payload = {
        scheduleSid,
        startDate: moment().utc().format('YYYY-MM-DD'),
        endDate: moment().utc().format('YYYY-MM-DD'),
        startTime: moment().utc().format('HH:mm'),
        endTime: moment().utc().format('HH:mm'),
        recurring: 'weekly'
      };

      let availability = yield populate.availability.addDefault(payload);
      availability = availability.dataValues;
      availability.createdDate = availability.createdDate.toISOString();
      availability.editDate = availability.lastModifiedDate.toISOString();
      return _.omit(availability, omittedField);
    }
  });
});

/**
 * Creates account to schedule with proper join
 * @param {string} accountSidPrefix - Prefix of account sid
 * @returns {Object} - Sid of account and schedule
 */
function* createAccountAndSchedule(accountSidPrefix) {
  const accountSid = accountSidPrefix
    ? (yield populate.account.addDefault({sid: common.makeGenericSid(accountSidPrefix)})).sid
    : (yield populate.account.addDefault()).sid;
  const locationSid = (yield populate.location.addDefault({schedulingAccountSid: accountSid})).sid;
  const calendarSid = (yield populate.calendar.addDefault({schedulingLocationSid: locationSid})).sid;
  const scheduleSid = (yield populate.schedule.addDefault({calendarSid})).sid;
  return {accountSid, scheduleSid};
}

