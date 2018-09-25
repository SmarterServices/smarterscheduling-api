'use strict';

const _ = require('lodash');
const moment = require('moment');
const availabilityData = require('./../data/availability');
const expect = require('chai').expect;
const common = require('./../common');
const {populate} = common;
const endpoints = require('./../data/endpoints.json');

describe('Availabiilty', function testAccounts() {
  let accountSid;
  let accountSid2;
  let scheduleSid;
  let availabilities = [];

  before('PopulateData', function* () {

    accountSid = (yield populate.account.addDefault()).sid;
    accountSid2 = (yield populate.account.addDefault()).sid;
    const locationSid = (yield populate.location.addDefault({schedulingAccountSid: accountSid})).sid;
    const calendarSid = (yield populate.calendar.addDefault({schedulingLocationSid: locationSid})).sid;
    scheduleSid = (yield populate.schedule.addDefault({calendarSid})).sid;
  });

  after('Clean Data', function* () {
    yield populate.account.clean();
    yield populate.calendar.clean();
    yield populate.location.clean();
    yield populate.schedule.clean();
    yield populate.availability.clean();
  });

  describe('POST', function () {
    const urlTemplate = endpoints.availability.post;
    const omittedField = ['sid', 'createdDate', 'editDate'];

    it('Should Add availability successfully and return 200 response', function () {
      const payload = _.cloneDeep(availabilityData.post.valid.payloadToCreate);
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

    it('Should update availability successfully and return 200 response', function () {
      const payload = _.cloneDeep(availabilityData.post.valid.payloadToUpdate);
      setDynamicDate(payload.update);
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

          expect(availabilityList.length).to.eql(2);
          for (let index = 0; index < availabilityList.length; index++) {
            let source;

            if (availabilityList[index].sid === availabilitySid) {
              source = _.omit(payload.update[0], 'sid');
              source.startTime = source.startTime + ':00';
              source.endTime = source.endTime + ':00';
            } else {
              source = Object.assign({}, availabilityData.post.valid.payloadToCreate.create[0], {
                startDate: availabilities[0].startDate,
                endDate: availabilities[0].endDate
              });
            }

            assertSuccessResponse(availabilityList[index], source, {scheduleSid});
          }
        });
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

  });
});


