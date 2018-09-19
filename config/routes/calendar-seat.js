'use strict';

const calendarSeatSchema = require('./schema/calendar-seat');

const calendarSeatHandler = require('./../../lib/handlers/calendar-seat');
const utils = require('./../../lib/helpers/utils');

module.exports = [/*{
  method: 'POST',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}/seats',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      calendarSeatHandler.addcalendarSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/calendar-seat', {calendarSeat: r}, reply);
        }
      });
    },
    tags: ['api', 'calendar Seat'],
    description: 'Add calendarSeat',
    validate: {
      params: calendarSeatSchema.add.params,
      payload: calendarSeatSchema.add.payload
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}/seats',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        query: Object.assign({}, request.query)
      };

      calendarSeatHandler.listcalendarSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('calendar-seat-collection.js',
            {
              calendarSeat: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'calendar Seat'],
    description: 'List calendarSeat',
    validate: {
      params: calendarSeatSchema.list.params,
      query: calendarSeatSchema.list.query
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}/seats/{calendarSeatSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      calendarSeatHandler.getcalendarSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/calendar-seat', {calendarSeat: r}, reply);
        }
      });
    },
    tags: ['api', 'calendar Seat'],
    description: 'Get calendarSeat',
    validate: {
      params: calendarSeatSchema.get.params
    }
  }
}, {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}/seats/{calendarSeatSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      calendarSeatHandler.updatecalendarSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/calendar-seat', {calendarSeat: r}, reply);
        }
      });
    },
    tags: ['api', 'calendar Seat'],
    description: 'Update calendarSeat',
    validate: {
      params: calendarSeatSchema.update.params,
      payload: calendarSeatSchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}/seats/{calendarSeatSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      calendarSeatHandler.deletecalendarSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'calendar Seat'],
    description: 'Delete calendarSeat',
    validate: {
      params: calendarSeatSchema.delete.params
    }
  }
}*/];
