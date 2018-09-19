'use strict';
const serverData = require('./../base-server');
const _ = require('lodash');
const Request = require('./request');
const moment = require('moment');
const populate = require('./populate');
const pagination = require('./pagination');

const randomString = require('randomstring');
const server = serverData.server;
const mock = require('./mock');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const errorList = require('./../config/errors/defined-errors.json');
const pify = require('pify');
const nock = require('nock');
const templateHelpers = require('./../lib/helpers/template-helpers');
const JsonMapper = require('./../lib/helpers/json-mapper');
const SequelizeMock = require('./mocks/sequelize');

const commonTools = {
  /**
   * Build URL from a url template
   * @param {string} urlTemplate - Url template of '/tet/{testSid}' pattern
   * @param {Object} params - Keys of the property must match with the param names in template
   * @param {Object} [query] - Keys of the object property must match with the query param name
   * @returns {string} - The complete URL with path and query param
   */
  buildUrl: function (urlTemplate, params, query) {
    let paramRegex = new RegExp('\{(.+?)\}', 'gm'),
      paramNames;

    do {
      //Get the matching params
      paramNames = paramRegex.exec(urlTemplate);

      //If there is a match and has a param value for the match
      //Using hasOwnProperty because param might also have null or 0 values which might result in false
      if (paramNames && params.hasOwnProperty(paramNames[1])) {

        //Replace and update the urlTemplate
        urlTemplate = urlTemplate.replace(paramNames[0], params[paramNames[1]]);
      }
    } while (paramNames);

    if (query) {
      // flag for first key
      let first = true;

      for (const queryKey in query) {
        // if first key use '?' as delimiter, '&' otherwise
        const delimiter = (first) ? '?' : '&';
        first = false;
        // append the query key-value pairs with original url
        const isObjectKey = typeof query[queryKey] === 'object';
        const queryValue = (isObjectKey) ?
          JSON.stringify(query[queryKey]) :
          query[queryKey];

        urlTemplate = urlTemplate + delimiter + queryKey + '=' + queryValue;
      }
    }

    return urlTemplate;
  },

  importTest: function importTest(path) {
    require(path);
  },

  convertIDTypeToInteger: function convertIDTypeToInteger(sequelizeModels) {
    for (const key in sequelizeModels) {
      if (sequelizeModels[key].rawAttributes.id) {
        sequelizeModels[key].rawAttributes.id.type.key = 'INTEGER';
        delete sequelizeModels[key].rawAttributes.id.defaultValue;
      }
    }
  },

  removeIsDeletedConstraint: function removeIsDeletedConstraint(sequelizeModels) {
    const promises = [];
    for (const key in sequelizeModels) {
      if (_.get(sequelizeModels, `${key}.rawAttributes.isDeleted`)) {
        promises.push(populate.dropIsDeletedConstraint(key));
      }
    }
    return Promise.all(promises);
  },

  // Make generic sid to be used with models
  makeGenericSid: function makeGenericSid(prefix = '', sidLength) {
    const length = sidLength || 32;
    const generatedString = randomString.generate({
      length,
      charset: 'hex'
    });

    const sid = prefix + generatedString;
    return sid;
  },

  /**
   * Removes the null properties from an object
   * @param {Object} obj - Object from which empty properties should be removed
   */
  removeNullOrEmptyProps: function removeNullOrEmptyProps(obj) {
    for (const prop in obj) {
      // Check for empty object
      const isEmptyObject = obj[prop] instanceof Object && Object.keys(obj[prop]).length === 0;
      if (obj.hasOwnProperty(prop) && (obj[prop] === null || isEmptyObject)) {
        delete obj[prop];
      }
    }
  },

  /**
   * Create a multipart form with a file array inside it's body
   * @param {Array<string>} filePathList - List of the paths of the files that are to be added inside the array
   * @param {string} key - Key of the file array
   * @returns {FormData} - Required form data with file
   */
  createFormDataWithFile: function createFormDataWithFile(filePathList, key) {
    const formData = new FormData();

    if (!Array.isArray(filePathList)) {
      filePathList = [filePathList];
    }

    filePathList.forEach(function (filePath) {
      const fileStream = fs.readFileSync(filePath);
      const filename = path.basename(filePath);
      formData.append(key, fileStream, {filename});
    });

    return formData;
  },

  /**
   * Assert failed response for a request
   * Use curry to partially apply the arguments
   * Function currying - https://en.wikipedia.org/wiki/Currying
   * @param {string} errorName - The name of the predefined error
   * @param {object} response - The HTTP response
   */
  assertFailResponse: _.curry((errorName, response) => {
    const DEFAULT_ERROR_STATUS_CODE = 400;

    const error = errorList[errorName];
    const expectedStatusCode = error.status || DEFAULT_ERROR_STATUS_CODE;

    expect(response.statusCode).to.equal(expectedStatusCode);
    expect(response.result.code).to.equal(error.code);
  }),
  /**
   * Verify the correctness of the page urls in response of LIST endpoints
   * @param {object} response - full response object
   * @param {object} response.result - The response body
   * @param {string} response.result.first - The url of first page
   * @param {string} response.result.next - The url of next page
   * @param {string} response.result.prev - The url of previous page
   * @param {string} response.result.last - The url of last page
   */
  verifyPagination: pagination.verifyPagination,

  /**
   * Sort an array of objects by date field
   * @param {Array<Object>} objArray - Array to be sorted
   * @param {string} dateFieldName - Date field name
   * @param {string} [order] - Valid values are 'ASC' and 'DESC', default 'ASC'
   */
  sortByDateField(objArray, dateFieldName = 'createdDate', order = 'ASC') {
    objArray.sort((a, b) => {
      const dateA = new Date(a[dateFieldName]);
      const dateB = new Date(b[dateFieldName]);

      return order === 'ASC'
        ? dateA - dateB
        : dateB - dateA;
    });
  },

  /**
   * Checks if a collection is sorted by provided iteratees
   * @param {Array} collection - Data to be checked
   * @param {Array<string|Function>} iteratees - Based on which sorting will be done
   * @param {Array<string|Function>} order - Order for respective iteratees
   */
  isSortedBy(collection, iteratees, order) {
    const sortedCollection = _.orderBy(collection, iteratees, order);

    expect(collection).to.eql(sortedCollection);
  },

  populate: populate,

  get request() {
    return new Request(server);
  },

  sequelize: serverData.sequelize,

  server: serverData.server,

  mock: mock,

  promisify: pify,


  /**
   * Remove a specific interceptor from the interceptor list
   * @param {Object} scope - Scope of interceptor
   * @param {Array} scope.interceptors - List of interceptors
   */
  removeMockInterceptor: function (scope) {
    scope.interceptors.forEach(interceptor => nock.removeInterceptor(interceptor));
  },

  /**
   * Format date to string
   * @param {Object} object - Required object
   * @returns {Object} - Formatted data
   */
  formatDates(object) {
    return _.mapValues(object, (prop) => {
      if (prop instanceof Date || prop instanceof moment) {
        return prop.toISOString();
      }

      return prop;
    });
  },
  /**
   * Flip case of a string
   * @param {string} string - Required string
   * @returns {string} - Case flipped string
   */
  flipCase(string) {
    const charArray = string.split('');
    const caseFlippedCharArray = charArray
      .map(char => {
        return char === char.toUpperCase()
          ? char.toLowerCase()
          : char.toUpperCase();
      });

    return caseFlippedCharArray.join('');
  },

  /**
   * Get the template mapped object
   * @param {string} templatePath - The relative path of the template
   * @param {Object} data - The data to be mapped
   * @returns {Object} - The mapped object
   */
  getMappedObject(templatePath, data) {
    const TEMPLATE_DIR = 'templates';
    const templateFullPath = process.cwd() + '/' + TEMPLATE_DIR + '/' + templatePath;
    const jsonMapper = new JsonMapper(templateHelpers.partials);
    const mapTemplate = require(templateFullPath);
    mapTemplate(jsonMapper, data);
    const mappedJson = JSON.stringify(jsonMapper.content);
    return JSON.parse(mappedJson);
  },


  /**
   * Build create charge payload which is sent to stripe client
   * @param {Object} payload - Payload sent to the request
   * @param {string} courseTitle - Course title
   * @param {string} examTitle - Exam title
   * @param {Object} schedulingData - Scheduling data
   * @param {Object} userData - User data
   * @param {string} sourceId - Source id of the stipe charge
   * @returns {string} - Create charge payload to stripe
   */
  buildCreateChargePayload(payload, courseTitle, examTitle, schedulingData, userData, sourceId) {
    const description = encodeURIComponent(`${courseTitle}::${examTitle}`);
    let createChargePayload = `amount=${payload.amount*100}&currency=${payload.currency}`;
    createChargePayload += `&capture=true&description=${description}`;
    createChargePayload += `&metadata%5BexamSid%5D=${schedulingData.examSid}&metadata%5B`;
    createChargePayload += `enrollmentSid%5D=${schedulingData.enrollmentSid}&metadata%5B`;
    createChargePayload += `courseSid%5D=${schedulingData.courseSid}&metadata%5B`;
    createChargePayload += `examSessionSid%5D=${schedulingData.sessionSid}&customer=${userData.spStripeCustomerId}`;
    createChargePayload += `&source=${sourceId}`;
    return createChargePayload;
  },

  /**
   * Checks if given object has null property for given field
   * @param {Object} data - The object that should have the null field
   * @param {Array<string>} [fieldsToCheck] - Name of the fields whose value should be null
   */
  checkNullProps(data, fieldsToCheck) {
    if (!fieldsToCheck || !fieldsToCheck.length) {
      fieldsToCheck = Object.keys(data);
    }
    fieldsToCheck.forEach((field) => {
      expect(data[field]).to.eql(null);
    });
  },

  /**
   * Compares Database error to the given response
   * @param {Object} response - Response from Request
   * @param {string} errorName - Name of the error
   */
  compareDatabaseError(response, errorName = 'DATABASE_ERROR') {
    const errorMessage = errorResponse.ERROR_LIST[errorName].message;
    let errorCode = 400;
    let statusCode = 400;

    if (errorName !== 'DATABASE_ERROR') {
      errorCode = errorResponse.ERROR_LIST[errorName].code;
      statusCode = errorResponse.ERROR_LIST[errorName].status || 400;
    }

    const result = response.result;
    expect(response.statusCode).to.equal(errorCode);
    expect(result.status).to.equal(statusCode);
    expect(result.message).to.eql(errorMessage);
  },

  /**
   * Request and verifies response for database failure test
   * @param {Object} data - Data Required for test
   * @param {string} data.type - Type of sequelize action to mock
   * @param {string} data.name - Name of model or raw query
   * @param {string} data.request - Actual request to call
   * @param {string} data.fileNamePattern - Pattern of the file name when type is rawQuery
   * @returns {Promise} - Response of the test
   */
  testDatabaseFailure(data) {
    const _this = this;
    const {type, name, request, fileNamePattern} = data;
    const sequelizeMock = new SequelizeMock();

    switch (type) {
      case 'addData':
        sequelizeMock.addData(name);
        break;
      case 'listData':
        sequelizeMock.listData(name);
        break;
      case 'getData':
        sequelizeMock.getData(name);
        break;
      case 'deleteData':
        sequelizeMock.deleteData(name);
        break;
      case 'updateData':
        sequelizeMock.updateData(name);
        break;
      case 'bulkCreate':
        sequelizeMock.bulkCreate(name);
        break;
      case 'rawQuery':
        sequelizeMock.mockQueryWithStackTrace(name, fileNamePattern);
        break;
      default:
        return Promise.reject('Type mismatched');
    }

    return request
      .end()
      .then(function (response) {
        _this.compareDatabaseError(response);
        sequelizeMock.restore();
      });
  }
};

module.exports = commonTools;
