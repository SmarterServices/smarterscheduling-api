'use strict';

const _ = require('lodash');
const assert = require('chai').assert;
const accountData = require('./../data/account.json');
const expect = require('chai').expect;
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');
const moment = require('moment');

describe('Accounts', function testAccounts() {
  const accounts = [];

  after('Clean Data', function () {
    return common.populate.account.clean();
  });

  describe('POST', function () {
    const url = endpoints.account.post;
    const omittedField = ['sid', 'editDate', 'createdDate'];

    it('Should Add account successfully with no [sid] in [payload] and return 200 response', function () {
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

    it('Should Add account with [sid] in [payload] having prefix [PA] and return 200 response', function () {
      const payload = _.cloneDeep(accountData.post.payload.valid);
      payload.sid = common.makeGenericSid('PA');

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          accounts.push(result);
          expect(_.omit(result, omittedField)).to.eql(_.omit(payload, omittedField));
        });

    });

    it('Should Add account with [sid] in [payload] having prefix [SA] and return 200 response', function () {
      const payload = _.cloneDeep(accountData.post.payload.valid);
      payload.sid = common.makeGenericSid('SA');

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          accounts.push(result);
          expect(_.omit(result, omittedField)).to.eql(_.omit(payload, omittedField));
        });

    });

    it('Should not Add account for existing [sid] in [payload] and return 404 response', function () {
      const payload = _.cloneDeep(accountData.post.payload.valid);
      payload.sid = accounts[0].sid;

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('SID_ALREADY_EXISTS', response);
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

    it('Should fail for database failure of [getAccount] and return 400 response', function () {
      const payload = _.cloneDeep(accountData.post.payload.valid);
      payload.sid = accounts[0].sid;
      const request = common.request.post(url).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'getData',
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
          common.verifyPagination(response);
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

  describe('GET', function () {
    const urlTemplate = endpoints.account.get;
    it('Should get account successfully for [SA prefixed] [account] and return 200 response', function () {
      // The first account which was added is 'SA' prefixed account
      const params = {
        accountSid: accounts[0].sid
      };

      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result).to.eql(accounts[0]);
        });
    });

    it('Should get account successfully for [PA prefixed] [account] and return 200 response', function () {
      // The second account which was added is 'PA' prefixed account
      const params = {
        accountSid: accounts[1].sid
      };

      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result).to.eql(accounts[1]);
        });
    });

    it('Should fail to get account for invalid [accountSid] and return 404 response', function () {
      const params = {
        accountSid: common.makeGenericSid('SA')
      };

      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });
  });

  describe('LIST Appointment Availability', function () {
    let accountSid;
    let accountSid1;
    let accountSid2;
    let calendarSid;
    let calendarSid1;
    let locationSid;
    let locationSid1;
    const startDateTime = moment().toISOString();
    const endDateTime = moment().add(1, 'd').toISOString();
    const urlTemplate = endpoints.account.listAppointmentAvailability;
    const duration = 30;
    const TOTAL_AVAILABILITY = 5;

    before('PopulateData', function* () {
      accountSid = (yield common.populate.account.addDefault()).sid;
      accountSid1 = (yield common.populate.account.addDefault()).sid;
      accountSid2 = (yield common.populate.account.addDefault({sid: common.makeGenericSid('PA')})).sid;
      locationSid = (yield common.populate.location.addDefault({
        schedulingAccountSid: accountSid
      })).sid;
      locationSid1 = (yield common.populate.location.addDefault({
        schedulingAccountSid: accountSid1
      })).sid;
      calendarSid = (yield common.populate.calendar.addDefault({
        schedulingLocationSid: locationSid,
        title: 'test'
      })).sid;
      calendarSid1 = (yield common.populate.calendar.addDefault({
        schedulingLocationSid: locationSid1,
        title: 'test'
      })).sid;
    });

    after('Clean Data', function* () {
      yield common.populate.account.clean();
      yield common.populate.calendar.clean();
      yield common.populate.location.clean();
    });

    it('Should list successfully and return 200 response', function () {
      const query = {
        calendarSid,
        startDateTime,
        endDateTime,
        duration
      };
      const url = common.buildUrl(urlTemplate, {accountSid}, query);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {

          const result = response.result.results;
          expect(result.length).to.eql(TOTAL_AVAILABILITY);
          for (const appointment of result) {
            expect(appointment.duration).to.equal(query.duration);
          }
        });
    });

    it('Should list successfully for [PA prefixed] [account] and return 200 response', function* () {
      const query = {
        calendarSid,
        startDateTime,
        endDateTime,
        duration
      };
      const url = common.buildUrl(urlTemplate, {accountSid: accountSid2}, query);

      //Changing the accountSid of the location to a 'PA' prefixed account
      yield common.populate.location.update({schedulingAccountSid: accountSid2}, {sid: locationSid});

      yield common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result.results;
          expect(result.length).to.eql(TOTAL_AVAILABILITY);
          for (const appointment of result) {
            expect(appointment.duration).to.equal(query.duration);
          }
        });

      // Reverting back the changes of the location
      yield common.populate.location.update({schedulingAccountSid: accountSid}, {sid: locationSid});
    });

    // TODO: Test should be updated in future, since for different calendarSid response will be different
    it('Should list successfully for different [calendarSid] and return 200 response', function () {
      const query = {
        startDateTime,
        endDateTime,
        duration,
        calendarSid: calendarSid1
      };
      const url = common.buildUrl(urlTemplate, {accountSid: accountSid1}, query);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result.results;
          expect(result.length).to.eql(TOTAL_AVAILABILITY);
          for (const appointment of result) {
            expect(appointment.duration).to.equal(query.duration);
          }
        });
    });

    // TODO: Currently reponse is a hard-coded data only duration is dynamic
    it('Should list successfully for different [duration] and return 200 response', function () {
      const query = {
        startDateTime,
        endDateTime,
        calendarSid,
        duration: 30
      };
      const url = common.buildUrl(urlTemplate, {accountSid}, query);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result.results;
          expect(result.length).to.eql(TOTAL_AVAILABILITY);
          for (const appointment of result) {
            expect(appointment.duration).to.equal(query.duration);
          }
        });
    });

    it('Should fail for [startDate] greater than [endDate] and return 400 response', function () {
      const query = {
        calendarSid,
        startDateTime,
        endDateTime: moment(startDateTime).subtract(1, 'd').toISOString(),
        duration
      };
      const url = common.buildUrl(urlTemplate, {accountSid}, query);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('END_DATE_TIME_SHOULD_BE_AFTER_START_DATE_TIME', response);
        });
    });

    it('Should fail for invalid [accountSid] and return 400 response', function () {
      const query = {
        calendarSid,
        startDateTime,
        endDateTime,
        duration
      };
      const url = common.buildUrl(urlTemplate, {
        accountSid: common.makeGenericSid('SA')
      }, query);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });

    it('Should fail for invalid [calendarSid] and return 400 response', function () {
      const query = {
        startDateTime,
        endDateTime,
        duration,
        calendarSid: common.makeGenericSid('CL')
      };
      const url = common.buildUrl(urlTemplate, {accountSid}, query);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('CALENDAR_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for [calendar] having different [locationSid] and return 400 response', function* () {
      yield common.populate.calendar.update({schedulingLocationSid: locationSid1}, {sid: calendarSid});
      const query = {
        startDateTime,
        endDateTime,
        duration,
        calendarSid
      };
      const url = common.buildUrl(urlTemplate, {accountSid}, query);

      yield common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('CALENDAR_NOT_FOUND_UNDER_ACCOUNT', response);
        });
      yield common.populate.calendar.update({schedulingLocationSid: locationSid}, {sid: calendarSid});
    });

    it('Should fail for db fail of [listAppointmentAvailability] and return 400 response', function () {
      const query = {
        startDateTime,
        endDateTime,
        duration,
        calendarSid
      };
      const url = common.buildUrl(urlTemplate, {accountSid}, query);

      const request = common.request.get(url);

      return common
        .testDatabaseFailure({
          request,
          type: 'rawQuery',
          name: 'listAppointmentAvailability',
          fileNamePattern: /.*services[\\\/]account\.js/
        });
    });

    it('Should fail for db fail of [getCalendar] and return 400 response', function () {
      const query = {
        startDateTime,
        endDateTime,
        duration,
        calendarSid
      };
      const url = common.buildUrl(urlTemplate, {accountSid}, query);

      const request = common.request.get(url);

      return common
        .testDatabaseFailure({
          request,
          type: 'getData',
          name: 'location'
        });
    });

    it('Should fail for db fail of [getLocation] and return 400 response', function () {
      const query = {
        startDateTime,
        endDateTime,
        duration,
        calendarSid
      };
      const url = common.buildUrl(urlTemplate, {accountSid}, query);

      const request = common.request.get(url);

      return common
        .testDatabaseFailure({
          request,
          type: 'getData',
          name: 'location'
        });
    });
  });
});
