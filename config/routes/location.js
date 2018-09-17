'use strict';

const locationSchema = require('./schema/location');

const locationHandler = require('./../../lib/handlers/location');
const utils = require('./../../lib/helpers/utils');

module.exports = [{
  method: 'POST',
  path: '/v1/accounts/{accountSid}/locations',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      locationHandler.addLocation(opts, function (err, r) {
        if (err) {
          reply(err);
        } else {
          utils.replyJson('partials/location', {location: r}, reply);
        }
      });
    },
    tags: ['api', 'Location'],
    description: 'Add location',
    validate: {
      params: locationSchema.add.params,
      payload: locationSchema.add.payload
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/locations',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        query: Object.assign({}, request.query)
      };

      locationHandler.listLocation(opts, function (err, r) {
        if (err) {
          reply(err);
        } else {
          utils.replyJson('location-collection.js',
            {
              location: r,
              endpoint: utils.buildEndpointString(request),
              query: request.query
            }, reply);
        }
      });
    },
    tags: ['api', 'Location'],
    description: 'List location',
    validate: {
      params: locationSchema.list.params,
      query: locationSchema.list.query
    }
  }
}, {
  method: 'GET',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      locationHandler.getLocation(opts, function (err, r) {
        if (err) {
          reply(err);
        } else {
          utils.replyJson('partials/location', {location: r}, reply);
        }
      });
    },
    tags: ['api', 'Location'],
    description: 'Get location',
    validate: {
      params: locationSchema.get.params
    }
  }
}, {
  method: 'PUT',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params,
        payload: request.payload
      };

      locationHandler.updateLocation(opts, function (err, r) {
        if (err) {
          reply(err);
        } else {
          utils.replyJson('partials/location', {location: r}, reply);
        }
      });
    },
    tags: ['api', 'Location'],
    description: 'Update location',
    validate: {
      params: locationSchema.update.params,
      payload: locationSchema.update.payload
    }
  }
}, {
  method: 'DELETE',
  path: '/v1/accounts/{accountSid}/locations/{locationSid}',
  config: {
    handler: function (request, reply) {

      const opts = {
        params: request.params
      };

      locationHandler.deleteLocation(opts, function (err, r) {
        if (err) {
          reply(err);
        } else {
          reply(r);
        }
      });
    },
    tags: ['api', 'Location'],
    description: 'Delete location',
    validate: {
      params: locationSchema.delete.params
    }
  }
}];
