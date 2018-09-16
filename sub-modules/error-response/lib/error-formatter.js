'use strict';

const _ = require('lodash');
const config = require('config');
const defaultError = require('./data/default-error');
const path = process.cwd() + '/config/errors/defined-errors';
const errorList = require(path);


/**
 * Error formatter for response
 */
class ErrorFormatter {

  /**
   * Constructor for Error formatter
   */
  constructor() {
    this.ERROR_LIST = _.merge(defaultError, errorList);
    this.JOI_ERROR = this.ERROR_LIST.JOI;
    this.printError = _.get(config, 'errorResponse.printError', false);
    this.errorUrl = _.get(config, 'errorResponse.url');
    // this is the important line, as it make a closure
    // and make the context avaialbe to the closure
    this.failAction = this.failAction();
  }

  /**
   * Creates specific error format from joi or custom string
   * @param {Object|string}  error - The error to format
   * @param {{Object} | null} options - Options to modify error messages
   * @param {{values: {Object}}} options.values - Values to replace with defined message
   * @param {callback} [reply] - Reply to hapi server if it is passed
   * @returns {ResponseErrorFormat} - Formatted Error
   */
  formatError(error, options, reply) {
    if (this.printError) {
      console.error(error.stack || error);
    }

    let code;
    const isJoi = _.get(error, 'data.isJoi');
    let replyError;

    try {
      if (isJoi) {
        replyError = this.parseJoiError(error);
      } else if (typeof error === 'object') {
        //if the error is already formatted as a response
        replyError = Object.assign({}, error);
        if (error instanceof Error) {
          replyError.message = error.message;
        }
      } else {
        replyError = this.parseCustomError(error, options);
      }
      //Check if url exist or not and add it in error response
      if (!replyError.more_info && this.errorUrl) {
        code = replyError.code || '';
        replyError.more_info = this.errorUrl + code;
      }
      replyError.status = replyError.status || 400;
      replyError.status = parseInt(replyError.status);

      if (reply) {
        reply(replyError).code(replyError.status);
      }

      return replyError;
    } catch (error) {
      console.error(error.stack || error);
      return error;
    }
  }

  /**
   * Parses only one joi error and returns formatted response error
   * @param {Object} joiError - a sample joi error is given at the below of file
   * @returns {Object} parsedJoiError
   */
  parseJoiError(joiError) {
    let joiErrorObject;
    let parsedJoiError;
    let type;

    try {
      type = _.get(joiError, 'data.details[0].type');
      //Get Error object from error list
      joiErrorObject = Object.assign({},
        this.JOI_ERROR[type] || this.JOI_ERROR.NOT_LISTED);

      //if message is not listed, send joi message instead
      if (joiErrorObject.code === this.JOI_ERROR.NOT_LISTED.code) {
        joiErrorObject.message = _.get(joiError, 'data.details[0].message');
        return joiErrorObject;
      }

      parsedJoiError = this.replaceJoiErrorWithValues(joiErrorObject, joiError);
      return parsedJoiError;

    } catch (error) {
      console.error(error.stack || error);
      return this.JOI_ERROR.DEFAULT;
    }
  }

  /**
   *  Creates custom error format from given string
   * @param {string} customError - occurred error
   * @param {Object} options - Additional options
   * @param {{values: {Object}}} options.values - values to replace with defined message
   * @returns {Object} parsedCustomError
   */
  parseCustomError(customError, options) {
    let parsedError;
    let errorObject;

    try {
      //Get Error object from error list
      errorObject = Object.assign({},
        this.ERROR_LIST[customError] || this.ERROR_LIST.ERROR_NOT_LISTED);

      //if message is not listed, send customError message
      if (errorObject.code === this.ERROR_LIST.ERROR_NOT_LISTED.code) {
        errorObject.message = customError || errorObject.message;
        return errorObject;
      }
      parsedError = this.replaceWithValues(errorObject, _.get(options, 'values'));
      return parsedError;

    } catch (error) {
      console.error(error.stack || error);
      return this.ERROR_LIST.DEFAULT;
    }
  }

  /**
   * Replaces values in the message of default error object
   * @param {Object} errorObject - The error object
   * @param {{values: {Object}}} values - Values to replace in the default message
   * @returns {Object} replaced errorObject
   */
  replaceWithValues(errorObject, values) {
    let message;
    let regExp;
    if (!values) {
      const message = errorObject.message;
      errorObject.message = message.replace(/%(.+?)%/gm, function (match, group) {
        return group;
      });
      return errorObject;
    }

    //replace values in the message using regex
    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        message = errorObject.message || '';
        regExp = new RegExp(`%${key}%`, 'gm');
        errorObject.message = values[key]
          ? message.replace(regExp, values[key])
          : message.replace(regExp, key);
      }
    }
    return errorObject;
  }

  /**
   * Replaces values in the message of default error object
   * @param {Object} joiErrorObject - defined error object
   * @param {Object} joiError - The error that is created by joi
   * @returns {Object} replaced joiErrorObject
   */
  replaceJoiErrorWithValues(joiErrorObject, joiError) {
    let context;
    let message;
    let path;
    let regExp;
    let value;

    context = _.get(joiError, 'data.details[0].context');
    for (const key in context) {
      if (context.hasOwnProperty(key)) {
        message = joiErrorObject.message;
        regExp = new RegExp(`%${key}%`, 'gm');
        value = context[key];
        joiErrorObject.message = message.replace(regExp, value);

      }
    }
    //if value is not in context, replace it from payload
    if (!context['value']) {
      regExp = new RegExp('%value%', 'gm');
      //get path from joiError
      path = _.get(joiError, 'data.details[0].path');
      //Get value from payload
      value = _.get(joiError, 'data._object.' + path);
      joiErrorObject.message = joiErrorObject.message.replace(regExp, value);
    }
    return joiErrorObject;
  }

  /**
   * calls method to format a joi error and return response using reply callback
   * @param {Object} request - Request Object
   * @param {Function} reply - Callback for reply
   * @param {Object} source - Source
   * @param {Object} error - Joi error
   * @returns {Function} - Function to call
   */
  failAction() {
    const _this = this;
    return function (request, reply, source, error) {
      const formattedError = _this.formatError(error);
      reply(formattedError).code(400);
    };
  }
}

module.exports = ErrorFormatter;

/**
 * @typedef {Object} ResponseErrorFormat
 * @property {Number} code - error code
 * @property {String} message - A semi-detailed message about what went wrong
 * @property {String} more_info - An url for more info about the error
 *
 */
