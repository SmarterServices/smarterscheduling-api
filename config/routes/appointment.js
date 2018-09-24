'use strict';

const appointmentSchema = require('./schema/appointment');

const appointmentHandler = require('./../../lib/handlers/appointment');
const utils = require('./../../lib/helpers/utils');

module.exports = [/*{
  method: 'POST',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/appointments',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      appointmentHandler.addAppointment(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/appointment', {appointment: r}, reply);
        }
      });
    },
    tags: ['api', 'Appointment'],
    description: 'Add appointment',
    validate: {
      params: appointmentSchema.add.params,
      payload: appointmentSchema.add.payload
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/appointments',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        query: Object.assign({}, request.query)
      };

      appointmentHandler.listAppointment(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('appointment-collection.js',
            {
              appointment: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'Appointment'],
    description: 'List appointment',
    validate: {
      params: appointmentSchema.list.params,
      query: appointmentSchema.list.query
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/appointments/{appointmentSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      appointmentHandler.getAppointment(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/appointment', {appointment: r}, reply);
        }
      });
    },
    tags: ['api', 'Appointment'],
    description: 'Get appointment',
    validate: {
      params: appointmentSchema.get.params
    }
  }
}, {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/appointments/{appointmentSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      appointmentHandler.updateAppointment(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/appointment', {appointment: r}, reply);
        }
      });
    },
    tags: ['api', 'Appointment'],
    description: 'Update appointment',
    validate: {
      params: appointmentSchema.update.params,
      payload: appointmentSchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}/schedules/{scheduleSid}/appointments/{appointmentSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      appointmentHandler.deleteAppointment(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'Appointment'],
    description: 'Delete appointment',
    validate: {
      params: appointmentSchema.delete.params
    }
  }
}*/];
