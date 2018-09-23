
'use strict';

const joi = require('joi');

let schema = {
  add: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid')}),
    payload:joi.object({
     id: joi
      .string()
      .required()
      .description('Id'),
   isDeleted: joi
      .boolean()
      .required()
      .description('Is Deleted'),
   name: joi
      .string()
      .required()
      .description('Name'),
   createdDate: joi
      .date()
      .required()
      .description('Created Date'),
   lastModifiedDate: joi
      .date()
      .required()
      .description('Last Modified Date'),
   systemModstamp: joi
      .date()
      .required()
      .description('System Modstamp'),
   schedule: joi
      .string()
      .required()
      .description('Schedule'),
   scheduleRSid: joi
      .any()
      .required()
      .description('Schedule R Sid'),
   startDate: joi
      .date()
      .allow(null)
      .description('Start Date'),
   endDate: joi
      .date()
      .allow(null)
      .description('End Date'),
   dayOfWeek: joi
      .number()
      .required()
      .description('Day Of Week'),
   startTime: joi
      .any()
      .required()
      .description('Start Time'),
   endTime: joi
      .any()
      .required()
      .description('End Time'),
   recurring: joi
      .string()
      .allow(null)
      .description('Recurring')
  })
  .required()
  .description('Availability payload')
  },
  get: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid'),

        availabilitySid: joi
          .string()
          .required()
          .description('Availability Sid')})
  },
  update: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid'),

        availabilitySid: joi
          .string()
          .required()
          .description('Availability Sid')}),
    payload: joi.object({
     id: joi
      .string()
      .required()
      .description('Id'),
   isDeleted: joi
      .boolean()
      .required()
      .description('Is Deleted'),
   name: joi
      .string()
      .required()
      .description('Name'),
   createdDate: joi
      .date()
      .required()
      .description('Created Date'),
   lastModifiedDate: joi
      .date()
      .required()
      .description('Last Modified Date'),
   systemModstamp: joi
      .date()
      .required()
      .description('System Modstamp'),
   schedule: joi
      .string()
      .required()
      .description('Schedule'),
   scheduleRSid: joi
      .any()
      .required()
      .description('Schedule R Sid'),
   startDate: joi
      .date()
      .allow(null)
      .description('Start Date'),
   endDate: joi
      .date()
      .allow(null)
      .description('End Date'),
   dayOfWeek: joi
      .number()
      .required()
      .description('Day Of Week'),
   startTime: joi
      .any()
      .required()
      .description('Start Time'),
   endTime: joi
      .any()
      .required()
      .description('End Time'),
   recurring: joi
      .string()
      .allow(null)
      .description('Recurring')
  })
  .required()
  .description('Availability payload')
  },
  delete: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid'),

        availabilitySid: joi
          .string()
          .required()
          .description('Availability Sid')})
  },
  list: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        scheduleSid: joi
          .string()
          .required()
          .description('Schedule Sid')}),
    query: {
      offset: joi
        .number()
        .integer()
        .min(0)
        .description('Offset for the list'),
      limit: joi
        .number()
        .integer()
        .min(0)
        .description('Number of items to return'),
      sortKeys: joi
        .array()
        .items(joi.string())
        .single()
        .default([])
        .description('Keys to sort the data'),
      sortOrder: joi
        .string()
        .valid('ASC', 'DESC')
        .description('Sort order')
    }
  }
};

module.exports = schema;
    