'use strict';

const accountSchema = require('./schema/account');

const accountHandler = require('./../../lib/handlers/account');
const utils = require('./../../lib/helpers/utils');

module.exports = [{
  method: 'POST',
  path: '/v1/accounts',
  config: {
    handler: function (request, reply) {

      const opts = {
        payload: request.payload
      };

      accountHandler.addAccount(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('partials/account', {account: r}, reply);
        }
      });
    },
    tags: ['api', 'Account'],
    description: 'Add account',
    validate: {
      payload: accountSchema.add.payload
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts',
  config: {
    handler: function (request, reply) {

      const opts = {
        query: Object.assign({}, request.query)
      };

      accountHandler.listAccount(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('account-collection.js',
            {
              account: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'Account'],
    description: 'List account',
    validate: {
      query: accountSchema.list.query
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}',
  config: {
    handler: function (request, reply) {

      // Account data is coming from param validation plugin so, no need to call handler
      utils.replyJson('partials/account.js', {account: request.paramValidationResult.account}, reply);

      /*const opts = {
        params: request.params
      };

      accountHandler.getAccount(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/account', {account: r}, reply);
        }
      });*/
    },
    tags: ['api', 'Account'],
    description: 'Get account',
    validate: {
      params: accountSchema.get.params
    },
    plugins: {
      paramValidate: {
        relationName: 'account',
        primaryKey: 'accountSid'
      }
    }
  }
}, /* {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      accountHandler.updateAccount(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/account', {account: r}, reply);
        }
      });
    },
    tags: ['api', 'Account'],
    description: 'Update account',
    validate: {
      params: accountSchema.update.params,
      payload: accountSchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      accountHandler.deleteAccount(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'Account'],
    description: 'Delete account',
    validate: {
      params: accountSchema.delete.params
    }
  }
}*/{
  method: 'GET',
  path: '/v1/accounts/{accountSid}/availability',
  config: {
    handler: function (request, reply) {

      const opts = {
        query: Object.assign({}, request.query),
        paramValidationResult: request.paramValidationResult
      };

      accountHandler.listAppointmentAvailability(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('appointment-availability-collection.js',
            {
              appointmentAvailability: r,
            }, reply);
        }
      });
    },
    tags: ['api', 'Account'],
    description: 'List Appointment Availability',
    validate: {
      params: accountSchema.listAppointmentAvailability.params,
      query: accountSchema.listAppointmentAvailability.query
    },
    plugins: {
      paramValidate: {
        relationName: 'account',
        primaryKey: 'accountSid'
      }
    }
  }
}];
