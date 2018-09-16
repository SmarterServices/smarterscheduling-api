'use strict';

const appConfig = require('config');

// Initialize logger at the beginning
const Logger = require('node-logger');
global.logger = new Logger(appConfig.logger);
// these are global modules
global.errorResponse = require('error-response');

global.smarterServices = {
};

