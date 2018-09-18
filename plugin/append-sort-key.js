'use strict';

/**
 * Appends createdDate to sortKeys array in LIST endpoints
 * @param {Object} server
 * @param {Object} options
 * @param {Function} next
 */
exports.register = function appendCreatedDateToSortKey(server, options, next) {
  server.ext('onPreHandler', function (request, reply) {
    const sortKeys = request.query.sortKeys;
    const shouldAppendCreatedDate = sortKeys && sortKeys.indexOf('createdDate') === -1;

    if (shouldAppendCreatedDate) {
      request.query.sortKeys.push('createdDate');
    }

    reply.continue();
  });

  next();
};

exports.register.attributes = {
  name: 'append-sort-key'
};

