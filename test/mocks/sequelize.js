'use strict';

const sinon = require('sinon');
const Sequelize = require('sequelize');
const sequelizeModels = require('../../lib/middleware/db-connection').getModels();
const stackTrace = require('stack-trace');
const errorList = require('./../../config/errors/defined-errors');

/**
 * Class for mocking Sequelize
 * @class SequelizeMock
 */
class SequelizeMock {
  /**
   * Creates an instance of SequelizeMock. Creates an sinon sandbox as instance property.
   * @memberof SequelizeMock
   */
  constructor() {
    this.sandbox = sinon.createSandbox();
  }

  /**
   * Throws error if addData is called for specific model
   * @param {string} modelName - name of the model
   */
  addData(modelName) {
    const model = sequelizeModels[modelName];
    this
      .sandbox
      .stub(model.prototype, 'save')
      .callsFake(function () {
        return Promise.reject(new Error(errorList.DATABASE_ERROR.message));
      });
  }

  /**
   * Throws error if listData is called for specific model
   * @param {string} modelName - Name of the model
   */
  listData(modelName) {
    const model = sequelizeModels[modelName];

    this
      .sandbox
      .stub(model, 'findAndCountAll')
      .callsFake(function () {
        return Promise.reject({message: errorList.DATABASE_ERROR.message});
      });
  }

  /**
   * Throws error if getData is called for specific model
   * @param {string} modelName - Name of the model
   */
  getData(modelName) {
    const model = sequelizeModels[modelName];

    this
      .sandbox
      .stub(model, 'findOne')
      .callsFake(function () {
        return Promise.reject({message: errorList.DATABASE_ERROR.message});
      });
  }

  /**
   * Throws error if updateData is called for specific model
   * @param {string} modelName - Name of the model
   */
  updateData(modelName) {
    const model = sequelizeModels[modelName];

    this
      .sandbox
      .stub(model, 'update')
      .callsFake(function () {
        return Promise.reject({message: errorList.DATABASE_ERROR.message});
      });
  }

  /**
   * Throws error if bulkCreate is called for specific model
   * @param {string} modelName - Name of the model
   */
  bulkCreate(modelName) {
    const model = sequelizeModels[modelName];

    this
      .sandbox
      .stub(model, 'bulkCreate')
      .callsFake(function () {
        return Promise.reject({message: errorList.DATABASE_ERROR.message});
      });
  }

  /**
   * Throws error if deleteData is called for specific model
   * @param {string} modelName - Name of the model
   */
  deleteData(modelName) {
    const model = sequelizeModels[modelName];

    this
      .sandbox
      .stub(model, 'destroy')
      .callsFake(function () {
        return Promise.reject({message: errorList.DATABASE_ERROR.message});
      });
  }

  /**
   * Mocks query with regular expression
   * @param {string} regex - Required regular expression
   */
  mockQueryWithRegex(regex) {

    const queryStub = this.sandbox.stub(Sequelize.prototype, 'query');
    queryStub
      .callsFake(function (query, options) {
        if (query.match(regex)) {
          return Promise.reject({error: 'Failed To Query Data'});
        } else {
          return queryStub.wrappedMethod.call(this, query, options);
        }
      });
  }

  /**
   * Throws Error for Sequelize by checking the method name in stack trace for getData
   * @param {string} methodToCheck - The method to check in stack trace
   * @param {RegExp} [fileNameRegex] - Regular expression of file ane
   * @param {string} modelName - Name of the model
   */
  getDataWithStackTrace(methodToCheck, fileNameRegex, modelName) {
    const model = sequelizeModels[modelName];
    const getDataStub = this.sandbox.stub(model, 'findOne');
    const _this = this;

    getDataStub
      .callsFake(function (modelName, data) {
        const trace = stackTrace.get();
        const shouldThrowError = _this._findInStackTrace(trace, methodToCheck, fileNameRegex);

        if (shouldThrowError) {
          return Promise.reject({
            message: errorList.DATABASE_ERROR.message
          });
        } else {
          return getDataStub.wrappedMethod.call(this, modelName, data);
        }
      });
  }

  /**
   * Throws Error for Sequelize by checking the method name in stack trace for updateData
   * @param {string} methodToCheck - The method to check in stack trace
   * @param {RegExp} [fileNameRegex] - Regular expression of file ane
   * @param {string} modelName - Name of the model
   */
  updateDataWithStackTrace(methodToCheck, fileNameRegex, modelName) {
    const model = sequelizeModels[modelName];
    const updateDataStub = this.sandbox.stub(model, 'update');
    const _this = this;

    updateDataStub
      .callsFake(function (modelName, data) {
        const trace = stackTrace.get();
        const shouldThrowError = _this._findInStackTrace(trace, methodToCheck, fileNameRegex);

        if (shouldThrowError) {
          return Promise.reject({
            message: errorList.DATABASE_ERROR.message
          });
        } else {
          return updateDataStub.wrappedMethod.call(this, modelName, data);
        }
      });
  }

  /**
   * Throws Error for Sequelize by checking the method name in stack trace
   * @param {string} methodToCheck - The method to check in stack trace
   * @param {RegExp} [fileNameRegex] - Regular expression of file ane
   */
  mockQueryWithStackTrace(methodToCheck, fileNameRegex) {
    const queryStub = this.sandbox.stub(Sequelize.prototype, 'query');
    const _this = this;

    queryStub
      .callsFake(function (query, options) {
        const trace = stackTrace.get();
        const shouldThrowError = _this._findInStackTrace(trace, methodToCheck, fileNameRegex);

        if (shouldThrowError) {
          return Promise.reject({
            message: errorList.DATABASE_ERROR.message
          });
        } else {
          return queryStub.wrappedMethod.call(this, query, options);
        }
      });
  }

  /**
   * Restore the sandbox
   * @memberof Sequelize
   */
  restore() {
    this.sandbox.restore();
  }

  /**
   * Finds a method in the stack trace
   * @param {Array.<Object>} trace - list of callSite object
   * @param {string} methodToCheck - name of the method to search in stack trace
   * @param {RegExp} [fileNameRegex]  - name of the file
   * @returns {boolean} - Returns true if method is found in the trace
   */
  _findInStackTrace(trace, methodToCheck, fileNameRegex) {
    const isMethodPresent = trace.some((callSite) => {
      const fileCheck = fileNameRegex
        ? fileNameRegex.test(callSite.getFileName())
        : true;

      const methodCheck = callSite.getMethodName() === methodToCheck;

      return (methodCheck && fileCheck);
    });
    return isMethodPresent;
  }
}

module.exports = SequelizeMock;
