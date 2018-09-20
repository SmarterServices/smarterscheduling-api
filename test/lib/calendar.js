'use strict';

const _ = require('lodash');
const calendarData = require('./../data/calendar.json');
const expect = require('chai').expect;
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');
const sinon = require('sinon');
const scheduleService = require('./../../lib/services/schedule');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

describe('Calendar', function testCalendar() {
  const calendars = [];
  let accountSid;
  let locationSid;
  let sandbox;

  before('Populate Data', function* () {
    const account = yield common.populate.account.addDefault();
    accountSid = account.sid;
    const location = yield common.populate.location.addDefault({
      schedulingAccountSid: accountSid
    });
    locationSid = location.sid;
  });

  after('Clean Data', function* () {
    yield common.populate.calendar.clean();
    yield common.populate.seat.clean();
    yield common.populate.calendarSeat.clean();
    yield common.populate.schedule.clean();
  });

  describe('POST', function () {
    const urlTemplate = endpoints.calendar.post;

    it('Should Add calendar successfully and return 200 response', function () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {accountSid, locationSid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);
          expect(result.title).to.equal(payload.title);
          // Default value of interval is 10 and for endBuffer 0
          expect(result.schedule.interval).to.equal(10);
          expect(result.schedule.endBuffer).to.equal(0);
          calendars.push(result);
        });
    });

    it('Should Add calendar along with [seat], [calender-seat] and [schedule] and return 200 response', function () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {accountSid, locationSid};
      const url = common.buildUrl(urlTemplate, params);
      payload.interval = 2;
      payload.endBuffer = 4;

      sandbox = sinon.sandbox.create();
      const scheduleSpy = sandbox.spy(scheduleService, 'addSchedule');

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);
          expect(result.title).to.equal(payload.title);
          expect(result.schedule.interval).to.equal(payload.interval);
          expect(result.schedule.endBuffer).to.equal(payload.endBuffer);
          calendars.push(result);
          // listing all the calendarSeat data having the calendarSid of the created calendar
          return common.populate.calendarSeat.list({calendarSid: result.sid});
        })
        .then((data) => {
          expect(data.length).to.equal(payload.numberOfSeats);

          return common.populate.seat.list({
            sid: {
              [Op.in]: data.map(seat => seat.sid)
            }
          });
        })
        .then((data) => {
          // Iterating all the seats to check they have the required locationSid
          for (const seat of data) {
            expect(seat[0].schedulingLocationSid).to.equal(locationSid);
            expect(seat[0].title).to.not.equal(undefined);
          }
          return scheduleSpy.returnValues[0];
        })
        .then((data) => {
          expect(data.seatSid).to.equal(null);
        });
    });

    it('Should not be able to add calendar without [numberOfSeats] for [basic seat-management] and return 400 response', function () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {accountSid, locationSid};
      const url = common.buildUrl(urlTemplate, params);
      delete(payload.numberOfSeats);

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('NUMBER_OF_SEATS_REQUIRED', response);
        });
    });

    it('Should be able to add calendar without [numberOfSeats] for [advanced seat-management] and return 200 response', function* () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {accountSid, locationSid};
      const url = common.buildUrl(urlTemplate, params);
      delete(payload.numberOfSeats);

      yield common.populate.location.update({seatManagement: 'advanced'}, {sid: locationSid});

      yield common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);
          expect(result.title).to.equal(payload.title);
          expect(result.schedule.interval).to.equal(10);
          expect(result.schedule.endBuffer).to.equal(0);
          calendars.push(result);
        });

      yield common.populate.location.update({seatManagement: 'basic'}, {sid: locationSid});
    });

    it('Should not be able to add calender for invalid [accountSid] and return 400 response', function () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {
        locationSid,
        accountSid: common.makeGenericSid('SA')
      };
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });

    it('Should not be able to add calender for invalid [locationSid] and return 400 response', function () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {
        accountSid,
        locationSid: common.makeGenericSid('SL')
      };
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for database failure of [add calendar] and return 400 response', function () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {
        accountSid,
        locationSid
      };
      const url = common.buildUrl(urlTemplate, params);
      const request = common.request.post(url).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'addData',
          name: 'calendar'
        });
    });

    it('Should fail for database failure of [seat bulkCreate] and return 400 response', function* () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {
        accountSid,
        locationSid
      };
      const url = common.buildUrl(urlTemplate, params);
      const request = common.request.post(url).send(payload);

      const numberOfCalendersBefore = (yield common.populate.calendar.list({schedulingLocationSid: locationSid})).length;

      yield common
        .testDatabaseFailure({
          request,
          type: 'bulkCreate',
          name: 'seat'
        });

      const numberOfCalendersAfter = (yield common.populate.calendar.list({schedulingLocationSid: locationSid})).length;
      expect(numberOfCalendersBefore).to.equal(numberOfCalendersAfter);
    });

    it('Should fail for database failure of [calendar-seat bulkCreate] and return 400 response', function* () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {
        accountSid,
        locationSid
      };
      const url = common.buildUrl(urlTemplate, params);
      const request = common.request.post(url).send(payload);

      const numberOfCalendersBefore = (yield common.populate.calendar.list({schedulingLocationSid: locationSid})).length;
      const numberOfSeatsBefore = (yield common.populate.seat.list({schedulingLocationSid: locationSid})).length;

      return common
        .testDatabaseFailure({
          request,
          type: 'bulkCreate',
          name: 'calendar-seat'
        });

      const numberOfCalendersAfter = (yield common.populate.calendar.list({schedulingLocationSid: locationSid})).length;
      const numberOfSeatsafter = (yield common.populate.seat.list({schedulingLocationSid: locationSid})).length;
      expect(numberOfCalendersBefore).to.equal(numberOfCalendersAfter);
      expect(numberOfSeatsBefore).to.equal(numberOfSeatsafter);
    });

    it('Should fail for database failure of [add schedule] and return 400 response', function* () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {
        accountSid,
        locationSid
      };
      const url = common.buildUrl(urlTemplate, params);
      const request = common.request.post(url).send(payload);

      const numberOfCalendersBefore = (yield common.populate.calendar.list({schedulingLocationSid: locationSid})).length;
      const numberOfSeatsBefore = (yield common.populate.seat.list({schedulingLocationSid: locationSid})).length;
      const numberOfCalenderSeatsBefore = (yield common.populate.calendarSeat.list()).length;

      return common
        .testDatabaseFailure({
          request,
          type: 'addData',
          name: 'schedule'
        });

      const numberOfCalendersAfter = (yield common.populate.calendar.list({schedulingLocationSid: locationSid})).length;
      const numberOfSeatsafter = (yield common.populate.seat.list({schedulingLocationSid: locationSid})).length;
      const numberOfCalenderSeatsAfter = (yield common.populate.calendarSeat.list()).length;
      expect(numberOfCalendersBefore).to.equal(numberOfCalendersAfter);
      expect(numberOfSeatsBefore).to.equal(numberOfSeatsafter);
      expect(numberOfCalenderSeatsBefore).to.equal(numberOfCalenderSeatsAfter);
    });
  });
});

