'use strict';

const server = require('./base-server').server;
const Pack = require('./package');


server.on('request-error', function (request, error) {
  // Note: before Hapi v8.0.0, this should be 'internalError' instead of 'request-error'
  const cb = function (rollbarErr) {
    if (rollbarErr) {
      console.error('Error reporting to rollbar, ignoring: ' + rollbarErr);
    }
  };
  if (error instanceof Error) {
    return logger.error(error, request, cb);
  }
  logger.error('Error: ' + error, request, cb);
});
// End Rollbar initialization code


server.ext('onPreResponse', function (request, reply) {
  if (request.response && typeof request.response.header === 'function') {
    request.response.header('X-API-VERSION', Pack.version);
    if (process.env.HEROKU_RELEASE_VERSION) {
      request.response.header('X-DEPLOY-VERSION', process.env.HEROKU_RELEASE_VERSION);
    }
    if (process.env.HEROKU_SLUG_COMMIT) {
      request.response.header('X-COMMIT-VERSION', process.env.HEROKU_SLUG_COMMIT);
    }
    if (process.env.HEROKU_DYNO_ID) {
      request.response.header('X-SERVER-ID', process.env.HEROKU_DYNO_ID);
    }
    if (process.env.NODE_ENV) {
      request.response.header('X-ENV', process.env.NODE_ENV);
    }
  }
  reply.continue();
});
server.start(function () {
  logger.log('Server running at: ' + server.info.port);
});
