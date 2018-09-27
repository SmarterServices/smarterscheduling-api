'use strict';

const joi = require('joi');

const baseAvailabilitySchema = joi
  .object()
  .keys({
    startDate: joi
      .date()
      .required()
      .description('Start Date'),
    endDate: joi
      .date()
      .min(joi.ref('startDate'))
      .allow(null)
      .description('End Date'),
    dayOfWeek: joi
      .number()
      .integer()
      .required()
      .min(0)
      .max(6)
      .description('Day Of Week'),
    startTime: joi
      .date()
      .format('HH:mm')
      .required()
      .description('Start Time'),
    endTime: joi
      .date()
      .format('HH:mm')
      .min(joi.ref('startTime'))
      .required()
      .description('End Time'),
    recurring: joi
      .string()
      .valid('weekly')
      .default('weekly')
      .description('Recurring'),
  })
  .raw();//keeping the startTime and endTime as input format

const schema = {
  batchModify: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'accountSid')
          .required()
          .description('Account Sid'),
        scheduleSid: joi
          .string()
          .regex(/^SC[a-f0-9]{32}$/, 'Schedule Sid')
          .required()
          .description('Schedule Sid')
      }),
    payload: joi.object({
      create: joi
        .array()
        .items(
          baseAvailabilitySchema
        )
        .default([])
        .description('Availability to create'),
      update: joi
        .array()
        .items(
          baseAvailabilitySchema
            .keys({
              sid: joi
                .string()
                .regex(/^AV[a-f0-9]{32}$/, 'availability Sid')
                .required()
                .description('availability Sid')
            })
        )
        .default([])
        .description('Availability to update'),
      delete: joi
        .array()
        .items(
          joi
            .object({
              sid: joi
                .string()
                .regex(/^AV[a-f0-9]{32}$/, 'availability Sid')
                .required()
                .description('availability Sid')
            })
            .options({ //allow unknown attributes other than sid and remove them
              allowUnknown: true,
              stripUnknown: true
            })
        )
        .default([])
        .description('Availability to delete')
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
          .description('Availability Sid')
      })
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
          .description('Availability Sid')
      }),
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
          .description('Availability Sid')
      })
  },
  list: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),
        scheduleSid: joi
          .string()
          .regex(/^SC[a-f0-9]{32}$/, 'Schedule Sid')
          .required()
          .description('Schedule Sid')
      }),
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
        .items(joi
          .string()
          .valid('createdDate')
        )
        .single()
        .default(['createdDate'])
        .description('Keys to sort the data'),
      sortOrder: joi
        .string()
        .valid('ASC', 'DESC')
        .default('ASC')
        .description('Sort order')
    }
  },
  listCalendarAvailability: {
    params: joi
      .object({
        accountSid: joi
          .string()
          .regex(/^(SA)|(PA)[a-f0-9]{32}$/, 'Account Sid')
          .required()
          .description('Account Sid'),
        calendarSid: joi
          .string()
          .regex(/^CL[a-f0-9]{32}$/, 'Calendar Sid')
          .required()
          .description('Schedule Sid')
      }),
    query:joi
      .object({
        startDate: joi
          .date()
          .format('YYYY-MM-DD')
          .required()
          .description('Start Date'),
        endDate: joi
          .date()
          .format('YYYY-MM-DD')
          .min(joi.ref('startDate'))
          .required()
          .description('End Date')
      })
      .required()
      .raw()//keeping the startTime and endTime as input format
      .description('Query to get data')
  }
};

module.exports = schema;
