
'use strict';

const joi = require('joi');

let schema = {
  add: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid')}),
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
   interval: joi
      .number()
      .required()
      .description('Interval'),
   endBuffer: joi
      .number()
      .required()
      .description('End Buffer'),
   seat: joi
      .string()
      .allow(null)
      .description('Seat'),
   seatRSid: joi
      .any()
      .required()
      .description('Seat R Sid'),
   calendar: joi
      .string()
      .allow(null)
      .description('Calendar'),
   calendarRSid: joi
      .any()
      .required()
      .description('Calendar R Sid')
  })
  .required()
  .description('Schedule payload')
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
          .description('Schedule Sid')})
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
          .description('Schedule Sid')}),
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
   interval: joi
      .number()
      .required()
      .description('Interval'),
   endBuffer: joi
      .number()
      .required()
      .description('End Buffer'),
   seat: joi
      .string()
      .allow(null)
      .description('Seat'),
   seatRSid: joi
      .any()
      .required()
      .description('Seat R Sid'),
   calendar: joi
      .string()
      .allow(null)
      .description('Calendar'),
   calendarRSid: joi
      .any()
      .required()
      .description('Calendar R Sid')
  })
  .required()
  .description('Schedule payload')
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
          .description('Schedule Sid')})
  },
  list: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid')}),
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
    