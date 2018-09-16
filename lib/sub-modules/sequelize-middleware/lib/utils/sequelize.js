'use strict';

const Fs = require('fs');

const models = [];

const sequelizeHelper = {
  /**
   * Gets models for all database configurations
   * @param {Array} databaseConfigurations - All the database configurations given in the config
   * @param {Object} sequelizeInstances - Sequelize instances created in the herokuConnect class
   * @returns {Array.<Object>} - Returns models respective to sequelize instances
   */
  getModels: function (databaseConfigurations, sequelizeInstances) {

    const modelPath = process.cwd() + '/lib/models/';

    databaseConfigurations.forEach((config, index) => {
      models[index] = {};
    });

    let files;
    const jsFilePattern = /^(.+)\.js$/;

    try {
      files = Fs.readdirSync(modelPath);
    } catch (ex) {
      files = [];
    }

    files.forEach(function forEachFiles(file) {
      let fileName;

      if (jsFilePattern.test(file)) {
        fileName = jsFilePattern.exec(file)[1];

        try {
          databaseConfigurations.forEach((configuration, index) => {
            const model = require(modelPath + fileName);

            models[index][fileName] = model(sequelizeInstances[index], configuration.schema);
          });
        } catch (ex) {
          console.log('Error loading model :', fileName);
          console.log(ex.stack);
        }
      }
    });

    return models;
  }
};

module.exports = sequelizeHelper;

