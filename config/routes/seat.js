'use strict';

const seatSchema = require('./schema/seat');

const seatHandler = require('./../../lib/handlers/seat');
const utils = require('./../../lib/helpers/utils');

module.exports = [/*{
  method: 'POST',
  path: '/v1/accounts/{accountSid}/seats',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      seatHandler.addSeat(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('partials/seat', {seat: r}, reply);
        }
      });
    },
    tags: ['api', 'Seat'],
    description: 'Add seat',
    validate: {
      params: seatSchema.add.params,
      payload: seatSchema.add.payload
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/seats',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        query: Object.assign({}, request.query)
      };

      seatHandler.listSeat(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('seat-collection.js',
            {
              seat: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'Seat'],
    description: 'List seat',
    validate: {
      params: seatSchema.list.params,
      query: seatSchema.list.query
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/seats/{seatSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      seatHandler.getSeat(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('partials/seat', {seat: r}, reply);
        }
      });
    },
    tags: ['api', 'Seat'],
    description: 'Get seat',
    validate: {
      params: seatSchema.get.params
    }
  }
}, {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}/seats/{seatSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      seatHandler.updateSeat(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          utils.replyJson('partials/seat', {seat: r}, reply);
        }
      });
    },
    tags: ['api', 'Seat'],
    description: 'Update seat',
    validate: {
      params: seatSchema.update.params,
      payload: seatSchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}/seats/{seatSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      seatHandler.deleteSeat(opts, function (err, r) {
        if (err) {
          errorResponse.formatError(err, null, reply);
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'Seat'],
    description: 'Delete seat',
    validate: {
      params: seatSchema.delete.params
    }
  }
}*/];
