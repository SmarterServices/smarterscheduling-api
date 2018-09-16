'use strict';

const scheduleSchema = require('./schema/schedule');

const scheduleHandler = require('./../../lib/handlers/schedule');
const utils = require('./../../lib/helpers/utils');

module.exports = [/*{
  method: 'POST',
  path: '/v1/accounts/{accountSid}/schedules',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      scheduleHandler.addSchedule(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/schedule', {schedule: r}, reply);
        }
      });
    },
    tags: ['api', 'Schedule'],
    description: 'Add schedule',
    validate: {
      params: scheduleSchema.add.params,
      payload: scheduleSchema.add.payload
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/schedules',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        query: Object.assign({}, request.query)
      };

      scheduleHandler.listSchedule(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('schedule-collection.js',
            {
              schedule: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'Schedule'],
    description: 'List schedule',
    validate: {
      params: scheduleSchema.list.params,
      query: scheduleSchema.list.query
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      scheduleHandler.getSchedule(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/schedule', {schedule: r}, reply);
        }
      });
    },
    tags: ['api', 'Schedule'],
    description: 'Get schedule',
    validate: {
      params: scheduleSchema.get.params
    }
  }
}, {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      scheduleHandler.updateSchedule(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/schedule', {schedule: r}, reply);
        }
      });
    },
    tags: ['api', 'Schedule'],
    description: 'Update schedule',
    validate: {
      params: scheduleSchema.update.params,
      payload: scheduleSchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      scheduleHandler.deleteSchedule(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'Schedule'],
    description: 'Delete schedule',
    validate: {
      params: scheduleSchema.delete.params
    }
  }
}*/];
