'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const moment = require('moment');
const Sequelize = require('sequelize');
const sinon = require('sinon');

const calendarData = require('./../data/calendar.json');
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');
const Op = Sequelize.Op;
const scheduleService = require('./../../lib/services/schedule');

describe.only('Calendar', function testCalendar() {
  const calendars = [];
  // Calendars for 'PA' prefixed account and 'PL' prefixed location
  const calendars1 = [];
  let accountSid;
  // Account Sid having prefix 'PA'
  let accountSid1;
  let locationSid;
  // Location Sid having prefix 'PL'
  let locationSid1;
  let locationSid2;
  let sandbox;

  before('Populate Data', function* () {
    const account = yield common.populate.account.addDefault();
    accountSid = account.sid;
    accountSid1 = (yield common.populate.account.addDefault({
      sid: common.makeGenericSid('PA')
    })).sid;
    const location = yield common.populate.location.addDefault({
      schedulingAccountSid: accountSid
    });
    locationSid2 = (yield common.populate.location.addDefault({
      schedulingAccountSid: accountSid
    })).sid;
    locationSid = location.sid;
    locationSid1 = (yield common.populate.location.addDefault({
      sid: common.makeGenericSid('PL'),
      schedulingAccountSid: accountSid1
    })).sid;
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

    it('Should Add calendar under [PA prefixed] [account] and [PL prefixed] [location] return 200 response', function () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {
        accountSid: accountSid1,
        locationSid: locationSid1
      };
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
          expect(result.locationSid).to.equal(locationSid1);
          // Default value of interval is 10 and for endBuffer 0
          expect(result.schedule.interval).to.equal(10);
          expect(result.schedule.endBuffer).to.equal(0);
          //Result is pushed to calendars1 array because of different locationSid
          calendars1.push(result);
        });
    });

    it('Should Add calendar along with [seat], [calender-seat] and [schedule] and return 200 response', function () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const params = {accountSid, locationSid};
      const url = common.buildUrl(urlTemplate, params);
      payload.interval = 2;
      payload.endBuffer = 4;

      sandbox = sinon.createSandbox();
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

  describe('LIST', function () {
    const urlTemplate = endpoints.calendar.list;

    it('Should List calendar successfully and return 200 response', function () {
      const params = {accountSid, locationSid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result.total).to.eql(calendars.length);
          expect(result.count).to.eql(calendars.length);
          expect(result.results).to.eql(calendars);
          expect(response.statusCode).to.equal(200);
        });
    });

    it('Should List calendar for [PA prefixed] [account] and [PL prefixed] [location] and return 200 response', function () {
      const params = {
        accountSid: accountSid1,
        locationSid: locationSid1
      };
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(result.total).to.eql(calendars1.length);
          expect(result.count).to.eql(calendars1.length);
          expect(result.results).to.eql(calendars1);
          expect(response.statusCode).to.equal(200);
        });
    });

    it('Should List empty calendar for different [locationSid] and return 200 response', function () {
      const params = {accountSid, locationSid: locationSid2};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);
          expect(result.count).to.equal(0);
        });
    });

    it('Should list filtered by [limit, offset] successfully and return 200 response', function () {
      const limit = 1;
      let offset = 1;
      const params = {accountSid, locationSid};
      const url = common.buildUrl(urlTemplate, params, {limit, offset});

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.verifyPagination(response);
          const result = response.result;
          expect(result.total).to.eql(calendars.length);
          expect(result.count).to.eql(limit);

          for (const calendar of result.results) {
            expect(calendar).to.eql(calendars [offset++]);
          }
        });

    });

    it('Should fail to list for invalid [accountSid] and return 400 response', function () {
      const params = {
        accountSid: common.makeGenericSid('SA'),
        locationSid
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

    it('Should fail to list for invalid [locationSid] and return 400 response', function () {
      const params = {
        accountSid,
        locationSid: common.makeGenericSid('SL')
      };
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for [locationSid] under different [accountSid] and return 404 response', function* () {
      const params = {
        accountSid,
        locationSid
      };
      const url = common.buildUrl(urlTemplate, params);

      //update location with a different account
      yield common.populate.location.update({schedulingAccountSid: common.makeGenericSid('SA')}, {sid: locationSid});

      yield common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND_UNDER_ACCOUNT', response);
        });

      //revert changes
      yield common.populate.location.update({schedulingAccountSid: accountSid}, {sid: locationSid});
    });

    it('Should fail to list for database failure of [listCalender] and return 400 response', function () {
      const params = {accountSid, locationSid};
      const url = common.buildUrl(urlTemplate, params);
      const request = common.request.get(url);

      return common
        .testDatabaseFailure({
          request,
          type: 'rawQuery',
          name: 'listCalendar',
          fileNamePattern: /.*services[\\\/]calendar\.js/
        });
    });
  });

  describe('GET', function () {
    const urlTemplate = endpoints.calendar.get;

    it('Should get calendar successfully and return 200 response', function () {
      const calendarSid = calendars[0].sid;
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(200);
          expect(result).to.eql(calendars[0]);
        });
    });

    it('Should get calendar for [PA prefixed] [account] and [PL prefixed] [location] and return 200 response', function () {
      const calendarSid = calendars1[0].sid;
      const params = {
        calendarSid,
        accountSid: accountSid1,
        locationSid: locationSid1
      };
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(200);
          expect(result).to.eql(calendars1[0]);
        });
    });

    it('Should get calendar with [seat] successfully and return 200 response', function () {
      const calendarWithSeat = calendars.find((calendar) => calendar.numberOfSeats > 0);

      const calendarSid = calendarWithSeat.sid;
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(200);
          expect(result).to.eql(calendarWithSeat);
        });
    });

    it('Should get calendar without [seat] successfully and return 200 response', function () {
      const calendarWithoutSeat = calendars.find((calendar) => calendar.numberOfSeats === 0);

      const calendarSid = calendarWithoutSeat.sid;
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.eql(200);
          expect(result).to.eql(calendarWithoutSeat);
        });
    });

    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const calendarSid = calendars[0].sid;
      const params = {
        locationSid,
        calendarSid,
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

    it('Should fail for invalid [locationSid] and return 404 response', function () {
      const calendarSid = calendars[0].sid;
      const params = {
        accountSid,
        calendarSid,
        locationSid: common.makeGenericSid('SL')
      };
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for [locationSid] under different [accountSid] and return 404 response', function* () {
      const calendarSid = calendars[0].sid;
      const params = {accountSid, calendarSid, locationSid};
      const url = common.buildUrl(urlTemplate, params);

      //update location with a different account
      yield common.populate.location.update({schedulingAccountSid: common.makeGenericSid('SA')}, {sid: locationSid});

      yield common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND_UNDER_ACCOUNT', response);
        });

      //revert changes
      yield common.populate.location.update({schedulingAccountSid: accountSid}, {sid: locationSid});
    });

    it('Should fail for invalid [calendarSid] and return 404 response', function () {
      const params = {
        accountSid,
        locationSid,
        calendarSid: common.makeGenericSid('CL')
      };
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('CALENDAR_NOT_FOUND_UNDER_LOCATION', response);
        });
    });

    it('Should fail for [calendarSid] under different [locationSid] and return 404 response', function* () {
      const calendar = calendars[0];
      const calendarSid = calendars[0].sid;
      const params = {accountSid, calendarSid, locationSid};
      const url = common.buildUrl(urlTemplate, params);

      //update calendar with a different location
      yield common.populate.calendar.update({schedulingLocationSid: common.makeGenericSid('SL')}, {sid: calendarSid});

      yield common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('CALENDAR_NOT_FOUND_UNDER_LOCATION', response);
        });

      //revert changes
      yield common.populate.calendar.update({schedulingLocationSid: calendar.locationSid}, {sid: calendarSid});
    });

    it('Should fail for database failure of [get schedule] and return 400 response', function () {
      const calendarSid = calendars[0].sid;
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);
      const request = common.request.get(url);

      return common
        .testDatabaseFailure({
          request,
          type: 'getData',
          name: 'schedule'
        });
    });

    it('Should fail for database failure of [list calendarSeat] and return 400 response', function () {
      const calendarSid = calendars[0].sid;
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);
      const request = common.request.get(url);

      return common
        .testDatabaseFailure({
          request,
          type: 'listData',
          name: 'calendar-seat'
        });
    });
  });


  describe('PUT', function () {
    const urlTemplate = endpoints.calendar.update;
    let calendarSid;

    before('Init Data', () => {
      calendarSid = calendars[0].sid;
    });

    it('Should update calendar successfully and return 200 response', function () {
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);

          assertCalendarData(payload, calendars[0], result);
        });
    });

    it('Should update calendar for [PA prefixed] [account] and [PL prefixed] [location] and return 200 response', function () {
      const calendarSid = calendars1[0].sid;
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {
        calendarSid,
        accountSid: accountSid1,
        locationSid: locationSid1,
      };
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);

          assertCalendarData(payload, calendars1[0], result);
        });
    });


    it('Should update calendar successfully without changing seats if number of seat is [unchanged] and return 200 response', function* () {
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      const preRequestSeats = (yield common.populate.seat.list());
      const preRequestCalendarSeats = (yield common.populate.calendarSeat.list());


      yield common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);

          assertCalendarData(payload, calendars[0], result);
        });


      const postRequestSeats = (yield common.populate.seat.list());
      const postRequestCalendarSeats = (yield common.populate.calendarSeat.list());

      expect(preRequestCalendarSeats.length).to.equal(postRequestCalendarSeats.length);
      expect(preRequestSeats.length).to.equal(postRequestSeats.length);
    });

    it('Should update calendar successfully with adding [additional seats] and return 200 response', function* () {
      const numberOfSeatsToAdd = 3;
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      payload.numberOfSeats += numberOfSeatsToAdd;

      const preRequestSeats = (yield common.populate.seat.list());
      const preRequestCalendarSeats = (yield common.populate.calendarSeat.list());


      yield common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);

          assertCalendarData(payload, calendars[0], result);
        });


      const postRequestSeats = (yield common.populate.seat.list());
      const postRequestCalendarSeats = (yield common.populate.calendarSeat.list());

      expect(preRequestCalendarSeats.length + numberOfSeatsToAdd).to.equal(postRequestCalendarSeats.length);
      expect(preRequestSeats.length + numberOfSeatsToAdd).to.equal(postRequestSeats.length);

      const newSeats = _.differenceBy(postRequestCalendarSeats, preRequestCalendarSeats, 'sid');

      //All the newly added seats should be under the sent calendar
      newSeats.forEach((seat) => {
        expect(seat.calendarSid).to.equal(calendarSid);
      });
    });


    it('Should update calendar successfully with removing [additional seats] and return 200 response', function* () {
      //No need to subtract number of seats as it was added in the previous test
      const numberOfSeatsToRemove = 3;
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);


      const preRequestSeats = (yield common.populate.seat.list());
      const preRequestCalendarSeats = (yield common.populate.calendarSeat.list());


      yield common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);

          assertCalendarData(payload, calendars[0], result);
        });


      const postRequestSeats = (yield common.populate.seat.list());
      const postRequestCalendarSeats = (yield common.populate.calendarSeat.list());

      expect(preRequestCalendarSeats.length - numberOfSeatsToRemove).to.equal(postRequestCalendarSeats.length);
      expect(preRequestSeats.length - numberOfSeatsToRemove).to.equal(postRequestSeats.length);

      const removedSeats = _.differenceBy(preRequestCalendarSeats, postRequestCalendarSeats, 'sid');

      //All the newly added seats should be under the sent calendar
      removedSeats.forEach((seat) => {
        expect(seat.calendarSid).to.equal(calendarSid);
      });
    });


    it('Should remove seats [without appointment] if possible and return 200 response', function* () {
      const numberOfSeatsToRemove = 1;
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      payload.numberOfSeats -= numberOfSeatsToRemove;


      const preRequestSeats = (yield common.populate.seat.list());
      const preRequestCalendarSeats = (yield common.populate.calendarSeat.list());

      const seatForAppointment = preRequestCalendarSeats.filter(seat => seat.calendarSid === calendarSid)[0].seatSid;

      const preRequestAppointment = (yield common.populate.appointment.addDefault({
        calendarSid,
        seatSid: seatForAppointment,
        startDate: moment().toISOString(),
        endDate: moment().toISOString()
      }));


      yield common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);

          assertCalendarData(payload, calendars[0], result);
        });


      const postRequestSeats = (yield common.populate.seat.list());
      const postRequestCalendarSeats = (yield common.populate.calendarSeat.list());
      const postRequestAppointment = (yield common.populate.appointment.list({seatSid: seatForAppointment}))[0];

      expect(preRequestCalendarSeats.length - numberOfSeatsToRemove).to.equal(postRequestCalendarSeats.length);
      expect(preRequestSeats.length - numberOfSeatsToRemove).to.equal(postRequestSeats.length);
      expect(postRequestAppointment.seatSid).to.equal(preRequestAppointment.seatSid);

      const removedCalendarSeats = _.differenceBy(preRequestCalendarSeats, postRequestCalendarSeats, 'sid');

      //All the newly added seats should be under the sent calendar
      removedCalendarSeats.forEach((seat) => {
        expect(seat.seatSid).to.not.equal(seatForAppointment);
        expect(seat.calendarSid).to.equal(calendarSid);
        expect(seat.calendarSid).to.equal(calendarSid);
      });


      //Revert back the number of seats
      yield common
        .request
        .put(url)
        .send(_.cloneDeep(calendarData.update.payload.valid))
        .end();
    });


    it('Should remove minimum number of seat [with appointment] and return 200 response', function* () {
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);
      const numberOfSeatsToRemove = payload.numberOfSeats - 1;

      payload.numberOfSeats -= numberOfSeatsToRemove;


      const preRequestSeats = (yield common.populate.seat.list());
      const preRequestCalendarSeats = (yield common.populate.calendarSeat.list());

      const seatsForAppointment = preRequestCalendarSeats
        .filter(seat => seat.calendarSid === calendarSid)
        .slice(0, 2)
        .map(seat => seat.seatSid);
      const preRequestAppointments = [];

      for (const seatSid of seatsForAppointment) {
        const appointment = yield common.populate.appointment.addDefault({
          calendarSid,
          seatSid,
          startDate: moment().toISOString(),
          endDate: moment().toISOString()
        });
        preRequestAppointments.push(appointment);
      }


      yield common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          expect(response.statusCode).to.equal(200);

          assertCalendarData(payload, calendars[0], result);
        });


      const postRequestSeats = (yield common.populate.seat.list());
      const postRequestCalendarSeats = (yield common.populate.calendarSeat.list());
      const postRequestAppointment = (yield common.populate.appointment.list({seatSid: seatsForAppointment}));

      expect(preRequestCalendarSeats.length - numberOfSeatsToRemove).to.equal(postRequestCalendarSeats.length);
      expect(preRequestSeats.length - numberOfSeatsToRemove).to.equal(postRequestSeats.length);

      const appointmentWithSeat = postRequestAppointment.filter(appointment => appointment.seatSid !== null);

      expect(appointmentWithSeat.length).to.equal(1);

      const removedCalendarSeats = _.differenceBy(preRequestCalendarSeats, postRequestCalendarSeats, 'sid');

      const removedCalderSeatWithAppointment = removedCalendarSeats
        .filter(seat => seatsForAppointment.includes(seat.seatSid));

      expect(removedCalderSeatWithAppointment.length).to.equal(1);

      //All the newly added seats should be under the sent calendar
      removedCalendarSeats.forEach((seat) => {
        expect(seat.seatSid).to.not.equal(seatsForAppointment);
        expect(seat.calendarSid).to.equal(calendarSid);
        expect(seat.calendarSid).to.equal(calendarSid);
      });
    });


    it('Should fail for invalid [calendarSid] and return 404 response', function () {
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid, locationSid, calendarSid: common.makeGenericSid('CL')};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('CALENDAR_NOT_FOUND_UNDER_LOCATION', response);
        });
    });


    it('Should fail for different [calendarSid] and return 404 response', function () {
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid, locationSid, calendarSid: calendars1[0].sid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('CALENDAR_NOT_FOUND_UNDER_LOCATION', response);
        });
    });


    it('Should fail for invalid [locationSid] and return 404 response', function () {
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid, locationSid: common.makeGenericSid('SL'), calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });


    it('Should fail for different [accountSid] and return 404 response', function () {
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid: accountSid1, locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('LOCATION_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });


    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const payload = _.cloneDeep(calendarData.update.payload.valid);
      const params = {accountSid: common.makeGenericSid('SA'), locationSid, calendarSid};
      const url = common.buildUrl(urlTemplate, params);

      return common
        .request
        .put(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });


    /**
     * Validate calendar data
     * @param {Object} payload - Payload sent for update
     * @param {Object} previousData - Previous calendar data
     * @param {Object} response - Response from update
     */
    function assertCalendarData(payload, previousData, response) {
      expect(payload.title).to.equal(response.title);
      expect(payload.numberOfSeats).to.equal(response.numberOfSeats);

      expect(previousData.schedule.sid).to.equal(response.schedule.sid);
      expect(payload.interval).to.equal(response.schedule.interval);
      expect(payload.endBuffer).to.equal(response.schedule.endBuffer);
    }
  });
});

