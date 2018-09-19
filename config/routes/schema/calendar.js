
'use strict';

const joi = require('joi');

const schema = {
  add: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^SA[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),
        locationSid: joi
          .string()
          .regex(/^SL[a-f0-9]{32}$/, 'Location Sid')
          .required()
          .description('Location Sid')}),
    payload:joi.object({
      title: joi
        .string()
        .max(255)
        .required()
        .description('Title'),
      numberOfSeats: joi
        .number()
        .integer()
        .positive()
        .description('Number of seats'),
      interval: joi
        .number()
        .integer()
        .default(10)
        .min(0)
        .max(999)
        .description('Interval'),
      endBuffer: joi
        .number()
        .integer()
        .default(0)
        .min(0)
        .max(999)
        .description('End buffer'),
    })
      .required()
      .description('Calendar payload')
  },
  get: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        locationSid: joi
          .string()
          .required()
          .description('Location Sid'),

        calendarSid: joi
          .string()
          .required()
          .description('Calendar Sid')})
  },
  update: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        locationSid: joi
          .string()
          .required()
          .description('Location Sid'),

        calendarSid: joi
          .string()
          .required()
          .description('Calendar Sid')}),
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
      schedulingLocation: joi
        .string()
        .required()
        .description('Scheduling Location'),
      schedulingLocationRSid: joi
        .any()
        .required()
        .description('Scheduling Location R Sid'),
      title: joi
        .string()
        .required()
        .description('Title')
    })
      .required()
      .description('Calendar payload')
  },
  delete: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        locationSid: joi
          .string()
          .required()
          .description('Location Sid'),

        calendarSid: joi
          .string()
          .required()
          .description('Calendar Sid')})
  },
  list: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        locationSid: joi
          .string()
          .required()
          .description('Location Sid')}),
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
