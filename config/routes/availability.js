'use strict';

const availabilitySchema = require('./schema/availability');

const availabilityHandler = require('./../../lib/handlers/availability');
const utils = require('./../../lib/helpers/utils');

module.exports = [{
  method: 'POST',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/availability',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      availabilityHandler.batchUpdateAvailability(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('availability-collection.js',
            {
              availability: r,
              endpoint: utils.buildEndpointString(request),
              query: {}
            }, reply);
        }
      });
    },
    tags: ['api', 'Availability'],
    description: 'Update availability',
    validate: {
      params: availabilitySchema.add.params,
      payload: availabilitySchema.add.payload
    },
    plugins: {
      paramValidate: [{
        relationName: 'schedule',
        primaryKey: 'scheduleSid'
      }, {
        relationName: 'account',
        primaryKey: 'accountSid'
      }]
    }
  }
}/*, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/availability',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        query: Object.assign({}, request.query)
      };

      availabilityHandler.listAvailability(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('availability-collection.js',
            {
              availability: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'Availability'],
    description: 'List availability',
    validate: {
      params: availabilitySchema.list.params,
      query: availabilitySchema.list.query
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/availability/{availabilitySid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      availabilityHandler.getAvailability(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/availability', {availability: r}, reply);
        }
      });
    },
    tags: ['api', 'Availability'],
    description: 'Get availability',
    validate: {
      params: availabilitySchema.get.params
    }
  }
}, {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/availability/{availabilitySid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      availabilityHandler.updateAvailability(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/availability', {availability: r}, reply);
        }
      });
    },
    tags: ['api', 'Availability'],
    description: 'Update availability',
    validate: {
      params: availabilitySchema.update.params,
      payload: availabilitySchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/availability/{availabilitySid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      availabilityHandler.deleteAvailability(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'Availability'],
    description: 'Delete availability',
    validate: {
      params: availabilitySchema.delete.params
    }
  }
}*/];
