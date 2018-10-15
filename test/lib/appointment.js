'use strict';

const _ = require('lodash');
const moment = require('moment');
const expect = require('chai').expect;
const common = require('./../common');
const {populate} = common;

const appointmentData = require('./../data/appointment');
const calendarData = require('./../data/calendar');
const endpoints = require('./../data/endpoints.json');
const seatData = require('./../data/seat');

describe('Appointment', function testAppointment() {
  let accountSid;
  let accountSid2;
  let calendarSid;
  let locationSid;
  let seatSid;
  let seatSid2;
  let numberOfAddedAppointment = 0;

  before('populate data', function* () {
    const addedSids = yield createAccountAndCalendar();
    accountSid = addedSids.accountSid;
    calendarSid = addedSids.calendarSid;
    locationSid = addedSids.locationSid;

    accountSid2 = (yield populate.account.addDefault()).sid;

    const seatRelatedSids = yield addSeatAndSchedule(locationSid, calendarSid);
    seatSid = seatRelatedSids.seatSid;
    let scheduleSid = seatRelatedSids.scheduleSid;

    const seatRelatedSids2 = yield addSeatAndSchedule(locationSid, calendarSid);
    seatSid2 = seatRelatedSids2.seatSid;

    const availability = yield populate.availability.addDefault({
      scheduleSid,
      startDate: '2025-10-02',
      endDate: '2025-10-10',
      dayOfWeek: 6,
      recurring: 'weekly',
      startTime: '00:00',
      endTime: '23:00'
    });
  });

  after('clean data', function () {
    return Promise
      .all([
        populate.account.clean(),
        populate.appointment.clean(),
        populate.availability.clean(),
        populate.location.clean(),
        populate.calendar.clean(),
        populate.calendarSeat.clean(),
        populate.seat.clean()

      ]);
  });

  describe('LIST', function () {
    const urlTemplate = endpoints.appointment.list;
    const startDateISO = moment().add(1, 'd').toISOString();
    const endDateISO = moment(startDateISO).add(10, 'd').toISOString();
    let totalAddedAppointment = 0;
    const expectedResult = {};

    before('populate appointment', function* () {
      const diffDay = moment(endDateISO).diff(moment(startDateISO), 'd');

      for (let i = 0; i < diffDay; i++) {
        const numberOfAppointment = parseInt(Math.random() * 10) + 1;
        totalAddedAppointment += numberOfAppointment;
        const appointmentStartDate = moment(startDateISO).add(i, 'day');
        const appointment = yield addAppointment(appointmentStartDate, numberOfAppointment);
        expectedResult[appointmentStartDate.format('YYYY-MM-DD')] = appointment;
      }
    });

    it('Should List appointment and return 200 response', function test() {
      const queryParams = {
        startDate: moment(startDateISO).format('YYYY-MM-DD'),
        endDate: moment(endDateISO).format('YYYY-MM-DD')
      };

      const url = common.buildUrl(urlTemplate, {accountSid}, queryParams);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(totalAddedAppointment);
          expect(result.count).to.eql(totalAddedAppointment);

          expect(result.results).to.eql(expectedResult);
        });
    });

    it('Should filter by [calendarSid] and return 200 response', function test() {
      const queryParams = {
        startDate: moment(startDateISO).format('YYYY-MM-DD'),
        endDate: moment(endDateISO).format('YYYY-MM-DD'),
        calendarSid: common.makeGenericSid('CL')
      };

      const url = common.buildUrl(urlTemplate, {accountSid}, queryParams);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(0);
          expect(result.count).to.eql(0);
          expect(result.results).to.eql({});
        });
    });

    it('Should filter by [locationSid] and return 200 response', function test() {
      const queryParams = {
        startDate: moment(startDateISO).format('YYYY-MM-DD'),
        endDate: moment(endDateISO).format('YYYY-MM-DD'),
        locationSid: common.makeGenericSid('SL')
      };

      const url = common.buildUrl(urlTemplate, {accountSid}, queryParams);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(0);
          expect(result.count).to.eql(0);
          expect(result.results).to.eql({});
        });
    });

    it('Should return zero row for [different range] and return 200 response', function test() {
      const queryParams = {
        startDate: moment(startDateISO).subtract(10, 'day').format('YYYY-MM-DD'),
        endDate: moment(startDateISO).subtract(4, 'day').format('YYYY-MM-DD')
      };

      const url = common.buildUrl(urlTemplate, {accountSid}, queryParams);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(0);
          expect(result.count).to.eql(0);
          expect(result.results).to.eql({});
        });
    });

    it('Should return zero row for different [accountSid] and return 200 response', function test() {
      const queryParams = {
        startDate: moment(startDateISO).format('YYYY-MM-DD'),
        endDate: moment(endDateISO).format('YYYY-MM-DD')
      };

      const url = common.buildUrl(urlTemplate, {
        accountSid: accountSid2
      }, queryParams);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          const result = response.result;

          expect(response.statusCode).to.eql(200);
          expect(result.total).to.eql(0);
          expect(result.count).to.eql(0);
          expect(result.results).to.eql({});
        });
    });

    it('Should fail for invalid [accountSid] and return 404 response', function test() {
      const queryParams = {
        startDate: moment(startDateISO).format('YYYY-MM-DD'),
        endDate: moment(endDateISO).format('YYYY-MM-DD')
      };

      const url = common.buildUrl(urlTemplate, {
        accountSid: common.makeGenericSid('PA')
      }, queryParams);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });

    it('Should fail for [date range] greater than one month and return 400 response', function test() {
      const queryParams = {
        startDate: moment().format('YYYY-MM-DD'),
        endDate: moment().add(2, 'months').format('YYYY-MM-DD')
      };

      const url = common.buildUrl(urlTemplate, {accountSid}, queryParams);

      return common
        .request
        .get(url)
        .end()
        .then(function (response) {
          common.assertFailResponse('DATE_RANGE_IS_GREATER_THAN_MONTH', response);
        });
    });

    it('Should fail for [database failure] to list appointment and return 400 response', function test() {
      const queryParams = {
        startDate: moment(startDateISO).format('YYYY-MM-DD'),
        endDate: moment(endDateISO).format('YYYY-MM-DD')
      };

      const url = common.buildUrl(urlTemplate, {accountSid}, queryParams);
      const request = common.request.get(url);

      return common
        .testDatabaseFailure({
          request,
          type: 'rawQuery',
          name: 'listDateWiseAppointment',
          fileNamePattern: /.*services[\\\/]appointment\.js/
        });
    });

    /**
     * Adds appoinments for the given startDate and return formatted Response
     * @param {Object} startDateTime - StartDate to add the appointment
     * @param {number} numberOfRow -Number of appointment to add
     * @returns {Promise<Array<Object>>} - Formatter response
     */
    function* addAppointment(startDateTime, numberOfRow = 1) {
      const duration = parseInt(Math.random() * 100 + 1);
      const addedAppointments = [];

      for (let i = 0; i < numberOfRow; i++) {
        const startDate = moment(startDateTime).add(i, 'm').toISOString();
        const endDate = moment(startDate).add(duration, 'm').toISOString();
        const appointment = yield populate.appointment.addDefault({
          seatSid,
          calendarSid,
          startDate,
          endDate
        });
        const appointmentField = ['sid', 'firstName', 'lastName', 'email', 'phone', 'externalId', 'externalSystem',
          'notes', 'internalNotes', 'metadata'];
        const formattedAppointment = _.pick(appointment, appointmentField);
        Object.assign(formattedAppointment, {
          duration,
          startDateTime: appointment.startDate.toISOString(),
          endDateTime: appointment.endDate.toISOString(),
          calendar: {
            sid: calendarSid,
            title: calendarData.build.title
          },
          seat: {
            sid: seatSid,
            title: seatData.build.title,
            description: seatData.build.description
          }
        });

        addedAppointments.push(formattedAppointment);
      }

      return addedAppointments;
    }
  });

  describe('POST', function () {
    const urlTemplate = endpoints.appointment.post;

    it('Should add appointment successfully and return 200 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      const payload = Object.assign({}, appointmentData.post.payload.valid, {calendarSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          assertSuccessfulPostResponse(response, payload);
          numberOfAddedAppointment++;
        });
    });

    it('Should add appointment successfully filtered with [seatSid] and return 200 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      const payload = Object.assign({}, appointmentData.post.payload.valid, {calendarSid});
      payload.startDateTime = moment(payload.startDateTime).add(numberOfAddedAppointment * 10, 'm').toISOString();
      payload.seatSid = seatSid2;

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          assertSuccessfulPostResponse(response, _.omit(payload, 'seatSid'));
          expect(response.result.seatSid).to.eql(payload.seatSid);
          numberOfAddedAppointment++;
        });
    });

    it('Should add appointment with null as [metadata] and return 200 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      const payload = Object.assign({}, appointmentData.post.payload.valid, {
        calendarSid,
        metadata: null
      });
      payload.startDateTime = moment(payload.startDateTime).add(numberOfAddedAppointment * 10, 'm').toISOString();

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          assertSuccessfulPostResponse(response, _.omit(payload, 'seatSid'));
          numberOfAddedAppointment++;
        });
    });

    it('Should fail for invalid [accountSid] and return 404 response', function () {
      const url = common.buildUrl(urlTemplate, {
        accountSid: common.makeGenericSid('SA')
      });
      const payload = Object.assign({}, appointmentData.post.payload.valid, {calendarSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('ACCOUNT_NOT_FOUND', response);
        });
    });

    it('Should fail for invalid [calendarSid] and return 404 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      const payload = Object.assign({}, appointmentData.post.payload.valid, {
        calendarSid: common.makeGenericSid('CL')
      });

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('CALENDAR_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for [calendarSid] under different [accountSid] and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid: accountSid2});
      const payload = Object.assign({}, appointmentData.post.payload.valid, {calendarSid});

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('CALENDAR_NOT_FOUND_UNDER_ACCOUNT', response);
        });
    });

    it('Should fail for invalid [seatSid] and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      const payload = Object.assign({}, appointmentData.post.payload.valid, {calendarSid});
      payload.seatSid = common.makeGenericSid('SE');

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('APPOINTMENT_CREATION_FAILED', response);
        });
    });

    it('Should fail for unavailable [seat] and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      const payload = Object.assign({}, appointmentData.post.payload.valid, {calendarSid});
      //seat is not available in this date time
      payload.startDateTime = moment(payload.startDateTime).subtract('2', 'm').toISOString();

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          common.assertFailResponse('APPOINTMENT_CREATION_FAILED', response);
        });
    });

    it('Should fail for database failure of [validateCalendarWithAccount] and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      const payload = Object.assign({}, appointmentData.post.payload.valid, {calendarSid});
      const request = common.request.post(url).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'getData',
          name: 'calendar'
        });
    });

    it('Should fail for database failure of [addAppointment] and return 400 response', function () {
      const url = common.buildUrl(urlTemplate, {accountSid});
      const payload = Object.assign({}, appointmentData.post.payload.valid, {calendarSid});
      const request = common.request.post(url).send(payload);

      return common
        .testDatabaseFailure({
          request,
          type: 'rawQuery',
          name: 'addAppointment',
          fileNamePattern: /.*services[\\\/]appointment\.js/
        });
    });

  });

});

/**
 * Creates account to calendar with proper join
 * @param {string} accountSidPrefix - Prefix of account sid
 * @returns {Object} - Sid of account and schedule
 */
function* createAccountAndCalendar(accountSidPrefix) {
  const accountSid = accountSidPrefix
    ? (yield populate.account.addDefault({sid: common.makeGenericSid(accountSidPrefix)})).sid
    : (yield populate.account.addDefault()).sid;
  const locationSid = (yield populate.location.addDefault({schedulingAccountSid: accountSid})).sid;
  const calendarSid = (yield populate.calendar.addDefault({schedulingLocationSid: locationSid})).sid;
  return {accountSid, calendarSid, locationSid};
}


/**
 * Adds seat, calendarSeat and schedule for given location and calendar
 * @param {string} locationSid - Sid of location
 * @param {string} calendarSid - Sid of calendar
 * @returns {Object} - Sid of seat and schedule
 */
function* addSeatAndSchedule(locationSid, calendarSid) {
  const seat = yield populate.seat.addDefault({schedulingLocationSid: locationSid});
  let seatSid = seat.sid;
  const calendarSeat = yield populate.calendarSeat.addDefault({seatSid, calendarSid});
  const schedule = yield populate.schedule.addDefault({seatSid, calendarSid});
  const scheduleSid = schedule.sid;
  return {seatSid, scheduleSid};
}

/**
 * Asserts successful post response
 * @param {Object} source - Response object
 * @param {Object} payload - Payload to compare with
 */
function assertSuccessfulPostResponse(source, payload) {
  const expectedResponse = _.omit(payload, 'duration');
  Object.assign(expectedResponse, {
    endDateTime: moment(payload.startDateTime).add(payload.duration, 'minutes').toISOString(),
    internalNotes: null
  });

  expect(source.statusCode).to.eql(200);
  expect(_.omit(source.result, 'sid', 'seatSid')).to.eql(expectedResponse);
}
