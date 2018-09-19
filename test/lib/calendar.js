'use strict';

const _ = require('lodash');
const calendarData = require('./../data/calendar.json');
const expect = require('chai').expect;
const common = require('./../common');
const endpoints = require('./../data/endpoints.json');
const sinon = require('sinon');

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
          calendars.push(result);
        });

    });
  });
});

