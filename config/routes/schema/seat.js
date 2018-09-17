
'use strict';

const joi = require('joi');

const schema = {
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
      title: joi
        .string()
        .allow(null)
        .description('Title'),
      description: joi
        .string()
        .allow(null)
        .description('Description'),
      schedulingLocation: joi
        .string()
        .required()
        .description('Scheduling Location'),
      schedulingLocationSid: joi
        .any()
        .required()
        .description('Scheduling Location R Sid')
    })
      .required()
      .description('Seat payload')
  },
  get: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        seatSid: joi
          .string()
          .required()
          .description('Seat Sid')})
  },
  update: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        seatSid: joi
          .string()
          .required()
          .description('Seat Sid')}),
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
      title: joi
        .string()
        .allow(null)
        .description('Title'),
      description: joi
        .string()
        .allow(null)
        .description('Description'),
      schedulingLocation: joi
        .string()
        .required()
        .description('Scheduling Location'),
      schedulingLocationSid: joi
        .any()
        .required()
        .description('Scheduling Location R Sid')
    })
      .required()
      .description('Seat payload')
  },
  delete: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .required()
          .description('Account Sid'),

        seatSid: joi
          .string()
          .required()
          .description('Seat Sid')})
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
