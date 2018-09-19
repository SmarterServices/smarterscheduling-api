'use strict';

const _ = require('lodash');
const calendarData = require('./../data/calendar.json');
const expect = require('chai').expect;
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');
const sinon = require('sinon');

describe('Calendar', function testCalendar() {
  const calendars = [];
  let accountSid
  let sandbox;

  before('Populate Data', function* () {
    const account = yield common.populate.account.addDefault();
    const location = yield common.populate
  });

  after('Clean Data', function* () {
    yield common.populate.calendar.clean();
    yield common.populate.seat.clean();
    yield common.populate.calendarSeat.clean();
    yield common.populate.schedule.clean();
  });

  describe('POST', function () {
    const urlTemplate = endpoints.calendar.post;
    const omittedField = ['sid', 'editDate', 'createdDate'];

    it('Should Add calendar along with [seat], [schedule] and [calendar-seat] and return 200 response', function () {
      const payload = _.cloneDeep(calendarData.post.payload.valid);
      const url = common.buildUrl(urlTemplate, {});

      sandbox = sinon.sandbox.create();

      return common
        .request
        .post(url)
        .send(payload)
        .end()
        .then(function (response) {
          const result = response.result;
          calendars.push(result);


          sandbox.restore();
        });

    });
  });
});

