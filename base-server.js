'use strict';

try {
  //Require globals so that all the global variables are assigned
  require('./config/globals');

  const appConfig = require('config');

  const Hapi = require('hapi');
  const HapiJsonView = require('hapi-json-view');
  const HapiSwagger = require('hapi-swagger');
  const Inert = require('inert');
  const Pack = require('./package');
  const Path = require('path');
  const Vision = require('vision');
  const BodyParser = require('hapi-bodyparser');
  const paramValidatorPlugin = require('./plugin/validate-params');
  const utils = require('./lib/helpers/utils');
  const sortKeyPlugin = require('./plugin/append-sort-key');


  // Injecting sequelize namespace
  // This will trigger transactional queries
  // const cls = require('continuation-local-storage');
  // const namespace = cls.createNamespace(appConfig.databases[0].namespace);
  // const Sequelize = require('sequelize');
  // Sequelize.useCLS(namespace);

  // turn of node event emitter limit
  process.setMaxListeners(0);

  const server = global.server = new Hapi.Server({
    connections: {
      routes: {
        cors: {
          origin: ['*'],
          exposedHeaders: ['accept', 'content-type', 'token'],
          headers: ['accept', 'content-type', 'token']
        }
      }
    }
  });

  const serverSettings = Object.assign({}, appConfig.serverSettings);
  // override the port as heroku will assign ports dynamically.
  if (process.env.PORT) {
    serverSettings.port = process.env.PORT;
  }

  server.register(require('vision'), (err) => {

    if (err) {
      console.log('Failed to load vision.');
    }
  });

  server.connection(serverSettings);


  //For now we are only adding routes from these files only.
  const routes = [
    require('./config/routes'),
    require('./config/routes/account'),
    require('./config/routes/calendar'),
    require('./config/routes/exclusion'),
    require('./config/routes/location')
  ];

  // Inject failAction in each route
  for (let i = 0; i < routes.length; i++) {
    routes[i].forEach(function injectFailAction(route) {
      // Check if route has config.validate and doesn't have config.validate.failAction
      if (route.config && route.config.validate && !route.config.validate.failAction) {
        route.config.validate.failAction = errorResponse.failAction;
      }

      //Set max file size if allowing form data
      if (route.config && route.config.payload && route.config.payload.allow === 'multipart/form-data') {
        route.config.payload.maxBytes = appConfig.maximumUploadFileSize;
      }

      //allow unknown value in payload and strip them later
      utils.setAllowUnknown(route);

      //delete permission for development environment
      utils.deletePermission(route, appConfig);


    });
    server.route(routes[i]);
  }


  const swaggerOptions = {
    info: {
      title: 'Smarter Scheduling API',
      version: Pack.version
    },
    grouping: 'tags',
    sortTags: 'name',
    sortEndpoints: 'method',
    securityDefinitions: {
      client: {
        type: 'apiKey',
        name: 'token',
        in: 'header'
      }
    }
  };

  const bodyParserPlugin = {
    register: BodyParser,
    options: {
      parser: {allowDots: true},
      sanitizer: {
        trim: true, // remove first || end white space of String
        stripNullorEmpty: false // remove property when Null or Empty
      },
      merge: false,
      body: false
    }
  };

  const swaggerPlugin = {
    register: HapiSwagger,
    options: swaggerOptions
  };

  const plugins = [
    Inert,
    bodyParserPlugin,
    Vision,
    swaggerPlugin,
    paramValidatorPlugin,
    sortKeyPlugin
  ];

  server.register(plugins, function () {
    server.views({
      isCached: false,
      engines: {
        js: {
          module: HapiJsonView.create(),
          contentType: 'application/json'
        },
        html: require('handlebars')
      },
      path: Path.join(__dirname, 'templates'),
      partialsPath: Path.join(__dirname, 'templates/partials')
    });
  });

  logger.info('Base Server Loaded');
} catch (error) {
  if (global.logger) {
    logger.error(error.stack || error);
  } else {
    console.error(error.stack || error);
  }
}

const herokuInstance = require('./lib/middleware/db-connection');

module.exports = {
  server: server,
  sequelize: herokuInstance.getConnection()
};
