var Joi = require('joi');

module.exports = Joi.object({
  isDeleted: Joi
    .boolean()
    .required()
    .description('Is Deleted'),
  name: Joi
    .string()
    .required()
    .description('Name'),
  createdDate: Joi
    .date()
    .required()
    .description('Created Date'),
  systemModstamp: Joi
    .date()
    .required()
    .description('System Modstamp')
})
.required()
.description('Account payload');