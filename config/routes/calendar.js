'use strict';

const calendarSchema = require('./schema/calendar');

const calendarHandler = require('./../../lib/handlers/calendar');
const utils = require('./../../lib/helpers/utils');

module.exports = [{
  method: 'POST',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload,
        paramValidationResult: request.paramValidationResult
      };

      calendarHandler.addCalendar(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('partials/calendar', {calendar: r}, reply);
        }
      });
    },
    tags: ['api', 'Calendar'],
    description: 'Add calendar',
    validate: {
      params: calendarSchema.add.params,
      payload: calendarSchema.add.payload
    },
    plugins: {
      paramValidate: {
        relationName: 'location',
        primaryKey: 'locationSid',
        parent: {
          relationName: 'account',
          primaryKey: 'accountSid'
        }
      }
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        query: Object.assign({}, request.query)
      };

      calendarHandler.listCalendar(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('calendar-collection.js',
            {
              calendar: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'Calendar'],
    description: 'List calendar',
    validate: {
      params: calendarSchema.list.params,
      query: calendarSchema.list.query
    },
    plugins: {
      paramValidate: {
        relationName: 'location',
        primaryKey: 'locationSid',
        parent: {
          relationName: 'account',
          primaryKey: 'accountSid'
        }
      }
    }
  }
}, /*{
  method: 'GET',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      calendarHandler.getCalendar(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/calendar', {calendar: r}, reply);
        }
      });
    },
    tags: ['api', 'Calendar'],
    description: 'Get calendar',
    validate: {
      params: calendarSchema.get.params
    }
  }
}, {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      calendarHandler.updateCalendar(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/calendar', {calendar: r}, reply);
        }
      });
    },
    tags: ['api', 'Calendar'],
    description: 'Update calendar',
    validate: {
      params: calendarSchema.update.params,
      payload: calendarSchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}/calendars/{calendarSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      calendarHandler.deleteCalendar(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'Calendar'],
    description: 'Delete calendar',
    validate: {
      params: calendarSchema.delete.params
    }
  }
}*/];
