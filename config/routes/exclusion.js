'use strict';

const exclusionSchema = require('./schema/exclusion');

const exclusionHandler = require('./../../lib/handlers/exclusion');
const utils = require('./../../lib/helpers/utils');

module.exports = [/*{
  method: 'POST',
  path: '/v1/accounts/{accountSid}/exclusions',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      exclusionHandler.addExclusion(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/exclusion', {exclusion: r}, reply);
        }
      });
    },
    tags: ['api', 'Exclusion'],
    description: 'Add exclusion',
    validate: {
      params: exclusionSchema.add.params,
      payload: exclusionSchema.add.payload
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/exclusions',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        query: Object.assign({}, request.query)
      };

      exclusionHandler.listExclusion(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('exclusion-collection.js',
            {
              exclusion: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'Exclusion'],
    description: 'List exclusion',
    validate: {
      params: exclusionSchema.list.params,
      query: exclusionSchema.list.query
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/exclusions/{exclusionSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      exclusionHandler.getExclusion(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/exclusion', {exclusion: r}, reply);
        }
      });
    },
    tags: ['api', 'Exclusion'],
    description: 'Get exclusion',
    validate: {
      params: exclusionSchema.get.params
    }
  }
}, {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}/exclusions/{exclusionSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      exclusionHandler.updateExclusion(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          utils.replyJson('partials/exclusion', {exclusion: r}, reply);
        }
      });
    },
    tags: ['api', 'Exclusion'],
    description: 'Update exclusion',
    validate: {
      params: exclusionSchema.update.params,
      payload: exclusionSchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}/exclusions/{exclusionSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      exclusionHandler.deleteExclusion(opts, function (err, r) {
        if (err) {
          reply(Boom.badRequest(err));
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'Exclusion'],
    description: 'Delete exclusion',
    validate: {
      params: exclusionSchema.delete.params
    }
  }
}*/];
