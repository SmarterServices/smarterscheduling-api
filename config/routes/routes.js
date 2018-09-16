'use strict';

const handler = require('./../../lib/handler');


const routes = [{
  method: 'GET',
  path: '/v1',
  config: {
    handler: function (request, reply) {
      const opts = {};

      handler.example(opts, function (err, r) {
        if (err) {
          reply(err);
        } else {
          reply(r);
        }
      });
    },
    tags: ['api']
  }
}];


module.exports = routes;

