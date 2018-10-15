'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/v1',
    config: {
      handler: function (request, reply) {
        reply({'working': true});
      },
      description: 'Application healthcheck endpoint',
      tags: ['api', 'Utilities']
    }
  }
];
