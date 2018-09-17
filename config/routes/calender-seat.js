'use strict';

const calenderSeatSchema = require('./schema/calender-seat');

const calenderSeatHandler = require('./../../lib/handlers/calender-seat');
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

      calenderSeatHandler.addCalenderSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/calender-seat', {calenderSeat: r}, reply);
        }
      });
    },
    tags: ['api', 'Calender Seat'],
    description: 'Add calenderSeat',
    validate: {
      params: calenderSeatSchema.add.params,
      payload: calenderSeatSchema.add.payload
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

      calenderSeatHandler.listCalenderSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('calender-seat-collection.js',
            {
              calenderSeat: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'Calender Seat'],
    description: 'List calenderSeat',
    validate: {
      params: calenderSeatSchema.list.params,
      query: calenderSeatSchema.list.query
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}/seats/{calenderSeatSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      calenderSeatHandler.getCalenderSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/calender-seat', {calenderSeat: r}, reply);
        }
      });
    },
    tags: ['api', 'Calender Seat'],
    description: 'Get calenderSeat',
    validate: {
      params: calenderSeatSchema.get.params
    }
  }
}, {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}/seats/{calenderSeatSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      calenderSeatHandler.updateCalenderSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/calender-seat', {calenderSeat: r}, reply);
        }
      });
    },
    tags: ['api', 'Calender Seat'],
    description: 'Update calenderSeat',
    validate: {
      params: calenderSeatSchema.update.params,
      payload: calenderSeatSchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}/seats/{calenderSeatSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      calenderSeatHandler.deleteCalenderSeat(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'Calender Seat'],
    description: 'Delete calenderSeat',
    validate: {
      params: calenderSeatSchema.delete.params
    }
  }
}*/];
