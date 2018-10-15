'use strict';

process.env.NODE_ENV = 'dev';
const validationService = require('./validation');



return validationService
  .withSibling({relationName: 'appInstall', primaryKeyValue: 'AIbde9a05b551d4e169a98d40bc1e59064', parentRelationName: 'accountDeployment'})
  .validate({relationName: 'course', primaryKeyValue: 'CU3cf8d86751bc453d9dcadb00c1caca05'})
  .then(console.log)
  .catch(console.log)
  .then(process.exit);

// return validationService
//   .withParent({relationName: 'appInstall', primaryKeyValue: 'AIbde9a05b551d4e169a98d40bc1e59065'})
//   .validate({relationName: 'fundingRule', primaryKeyValue: 'FR02e15ccb3f5e416b967d28be56c161dd'})
//   .then(console.log)
//   .catch(console.log)
//   .then(process.exit);
// .withParent('appInstall', 'AIbde9a05b551d4e169a98d40bc1e59064')
// .then(console.log)
// .catch(console.error);

// validationService.validate('exam', 'EX519de3e6f4194a49b6c6c299b1267c4a')
//   .withParent('appInstall', 'AId66aec09447e42d8ad41c78848812857')
//   .then(console.log)
//   .catch(console.error)

// validationService.validate('user', 'US1ec86494961e48e99f31a602b45a6704')
//   .throughParent('accountDeployment')
//   .withSibling('appInstall', 'AIbde9a05b551d4e169a98d40bc1e59064')
//   .then(console.log)
//   .catch(console.error)

// validationService.validate('user', 'US1ec86494961e48e99f31a602b45a6704')
//   .throughParent('accountDeployment')
//   .withSibling('appInstall', 'AIbde9a05b551d4e169a98d40bc1e59065')
//   .then(console.log)
//   .catch(console.error)

// validationService
//   .withAncestor([
//     {relationName: 'exam', primaryKeyValue: 'EXa261bcbcc991450d828b632d872066c3'},
//     {relationName: 'appInstall', primaryKeyValue: 'AI4051dae3355a4091829c3a3adfa12cf5'}
//   ])
//   .validate({relationName: 'examSession', primaryKeyValue: 'ES3b046703ac5a84f2528450445ae56564'})
//   .then(data => {
//     console.log(data);
//   })
//   .catch(error => {
//     console.error(error);
//   })
//   .then(() => process.exit())
//   .catch(process.exit)
