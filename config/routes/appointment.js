'use strict';

const appointmentSchema = require('./schema/appointment');
const appointmentHandler = require('./../../lib/handlers/appointment');
const utils = require('./../../lib/helpers/utils');

module.exports = [{
  method: 'POST',
  path: '/v1/accounts/{accountSid}/appointments',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      appointmentHandler.addAppointment(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
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
    },
    plugins: {
      paramValidate: {
        relationName: 'account',
        primaryKey: 'accountSid'
      }
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/appointments',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        query: Object.assign({}, request.query)
      };

      appointmentHandler.listAppointment(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('date-wise-appointment-collection.js',
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
    },
    plugins: {
      paramValidate: {
        relationName: 'account',
        primaryKey: 'accountSid'
      }
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/appointments/{appointmentSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        paramValidationResult: request.paramValidationResult
      };

      appointmentHandler.getAppointment(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('partials/appointment', {appointment: r}, reply);
        }
      });
    },
    tags: ['api', 'Appointment'],
    description: 'Get appointment',
    validate: {
      params: appointmentSchema.get.params
    },
    plugins: {
      paramValidate: [{
        relationName: 'account',
        primaryKey: 'accountSid'
      }, {
        relationName: 'appointment',
        primaryKey: 'appointmentSid'
      }]
    }
  }
}/*, {
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
}*/, {
  method: 'PATCH',
  path: '/v1/accounts/{accountSid}/appointments/{appointmentSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload,
        paramValidationResult: request.paramValidationResult
      };

      appointmentHandler.patchAppointment(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('partials/appointment', {appointment: r}, reply);
        }
      });
    },
    tags: ['api', 'Appointment'],
    description: 'Patch appointment',
    validate: {
      params: appointmentSchema.patch.params,
      payload: appointmentSchema.patch.payload
    },
    plugins: {
      paramValidate: [{
        relationName: 'account',
        primaryKey: 'accountSid'
      }, {
        relationName: 'appointment',
        primaryKey: 'appointmentSid'
      }]
    }
  }
}];
