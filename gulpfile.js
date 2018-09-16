'use strict';
//********************
/*      NOTICE      */
//********************
// Do not require any module here that somehow requires 'config' module
// If you do, then 'gulp-test' will not work
// as it expects NODE_ENV=test
// which is set from test.js file

// Require and load our packages
const gulp = require('gulp');
//********************
/*      NOTICE      */
//********************
// always use gulp-mocha v3 because other versions have some issue with gulp-istanbul
const mocha = require('gulp-mocha');
const run = require('gulp-run');
const istanbul = require('gulp-istanbul');
const env = require('gulp-env');


// Reference our app files for easy reference in out gulp tasks
const paths = {
  server: {
    specs: ['./test/lib/*.js'],
    libs_specs_path: ['./test/lib/']
  }
};


// The `default` task gets called when no task name is provided to Gulp
gulp.task('default', ['jslint', 'tests', 'docs'], function (cb) {
  cb().pipe(process.exit());
});
gulp.task('auth-doc', function (cb) {
  let authDoc = require('./scripts/endpointDocGen.js');
  authDoc()
    .then(res => {
      cb();
    })
    .catch(console.log);
});

/**
 * Run first half of the tests on the remote database
 */
gulp.task('test-part-1', function (cb) {
  const envs = env.set({
    NODE_ENV: 'test',
    testPart: 0
  });

  runTests(envs, cb);
});


/**
 * Run second half of the tests on the remote database
 */
gulp.task('test-part-2', function (cb) {

  const envs = env.set({
    NODE_ENV: 'test',
    testPart: 1
  });

  runTests(envs, cb);
});


/**
 * Run unit tests on remote database
 */
gulp.task('test', function (cb) {
  const envs = env.set({
    NODE_ENV: 'test'
  });

  runTests(envs, cb);
});

/**
 * Run first half of the tests on the local database
 */
gulp.task('dev-test-part-1', function (cb) {
  const envs = env.set({
    NODE_ENV: 'dev-test',
    testPart: 0
  });

  runTests(envs, cb);
});


/**
 * Run second half of the tests on the local database
 */
gulp.task('dev-test-part-2', function (cb) {

  const envs = env.set({
    NODE_ENV: 'dev-test',
    testPart: 1
  });

  runTests(envs, cb);
});

/**
 * Run unit tests on local database
 */
gulp.task('dev-test', function (cb) {
  const envs = env.set({
    NODE_ENV: 'dev-test'
  });

  gulp.src('lib/**/*.js')
    .pipe(istanbul({includeUntested: false})) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('error', function (error) {
      console.error(error);
    })
    .on('finish', function () {
      gulp.src('test/test.js')
        .pipe(envs)
        .pipe(mocha({reporter: 'spec', timeout: 30000}))
        .pipe(istanbul.writeReports({reporters: ['lcov', 'json', 'text-summary']}))
        .on('error', function (error) {
          console.error(error);
        })// Creating the reports after tests run
        .on('end', function () {
          cb();
          process.exit(0);
        });
    });
});


/**
 * Runs the test with specific
 * @param {Object} envs - Environment variables to use on the system
 * @param {string} envs.NODE_ENV - Node environment to use
 * @param {number} [envs.testStartingIndex] - Index to start test files from
 * @param {string} [envs.testEndingIndex] - Index to run test files upto
 * @param {Function} cb - Callback for handling response
 */
function runTests(envs, cb) {

  gulp.src('lib/**/*.js')
    .pipe(istanbul({includeUntested: true})) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('error', function (error) {
      console.error(error);
    })
    .on('finish', function () {

      gulp.src('test/test.js')
        .pipe(envs)
        .pipe(mocha({reporter: 'spec', timeout: 30000}))
        .pipe(istanbul.writeReports({reporters: ['lcov', 'json', 'text-summary']}))
        .on('error', function (error) {
          console.error(error);
        })// Creating the reports after tests run
        .on('end', function () {
          cb();
          process.exit(0);
        });
    });
}

gulp.task('lint', function () {
  return run('npm run lint').exec();
});


gulp.task('generate', function (cb) {
  const config = require('config');
  const generatorConfig = config.generator;
  const NodeForceModule = require('ss-node-force');
  //Create generator object with current location as root project directory
  //Config contains all the necessary credentials
  /*
   var trimOptions = {
   prefix: '(SP_)?',
   postfix: '(__c)',
   flags: 'i',
   groupToCapture: 2
   };
   var basePath = '';
   var generator = new NodeForceModule.Generator(__dirname, Config, null, 'v1', trimOptions, basePath);

   //Generate all the codes needed to get the API working
   generator
   .generate()
   .then(function (data) {
   cb();
   })
   .catch(function (ex) {
   console.log(ex);
   });
   */


  //For individual endpoint generation use the Endpoint generator method
  const generatorOptions = {
    credentials: generatorConfig.credentials,
    basePath: generatorConfig.basePath || __dirname,
    version: generatorConfig.version,
    endpointConfig: generatorConfig.endpointConfig
  };

  const endpointGenerator = new NodeForceModule
    .EndpointGenerator(generatorOptions);

  endpointGenerator.generateEndpoints()
    .then(function () {
      console.log('Done!');
    })
    .catch((function (error) {
      console.error(error.stack || error);
    }));
});


/**
 * Creates schema by changing NODE_ENV in 'test' or 'dev-test
 * @returns {Promise.<string>} schemaName - name of the schema
 */
const createSchema = function createSchema() {
  return new Promise(function createSchemaPromise(resolve, reject) {
    //Clean cache to run in different environment
    Object.keys(require.cache).forEach(function (module) {
      delete require.cache[module];
    });

    const nodeEnv = process.env.NODE_ENV === 'dev'
      ? 'dev-test'
      : 'test';

    const envs = env.set({
      NODE_ENV: nodeEnv
    });

    //set schemaName before requiring any module
    const config = require('config');
    const randomStringGenerator = require('randomstring');
    const randomSchemaConfig = {length: 10, capitalization: 'lowercase'};
    const schemaPrefix = 'sp_v2_unit_test_';
    const schemaName = schemaPrefix + randomStringGenerator.generate(randomSchemaConfig);
    config.databases[0].schema = schemaName;


    //do not require any service or module before setting schema name
    const dbBackupService = require('./lib/services/db-backup');

    dbBackupService
      .createSchema(schemaName)
      .then(function () {
        resolve(schemaName);
      })
      .catch(reject);

  });
};
