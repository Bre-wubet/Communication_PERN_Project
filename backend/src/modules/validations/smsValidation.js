import Joi from 'joi';

/**
 * SMS validation schemas
 */
export const smsSchemas = {
  sendSms: Joi.object({
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    message: Joi.string().min(1).max(1600).required(),
    provider: Joi.string().valid('twilio', 'aws-sns', 'messagebird').optional(),
    from: Joi.string().optional(),
  }),

  sendBulkSms: Joi.object({
    phoneNumbers: Joi.array().items(
      Joi.string().pattern(/^\+?[1-9]\d{1,14}$/)
    ).min(1).max(100).required(),
    message: Joi.string().min(1).max(1600).required(),
    provider: Joi.string().valid('twilio', 'aws-sns', 'messagebird').optional(),
    from: Joi.string().optional(),
    batchSize: Joi.number().integer().min(1).max(50).optional(),
    delay: Joi.number().integer().min(100).max(10000).optional(),
  }),

  sendSmsNotification: Joi.object({
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    message: Joi.string().min(1).max(1600).required(),
    provider: Joi.string().valid('twilio', 'aws-sns', 'messagebird').optional(),
    from: Joi.string().optional(),
  }),

  sendVerificationSms: Joi.object({
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    verificationCode: Joi.string().min(4).max(10).required(),
    provider: Joi.string().valid('twilio', 'aws-sns', 'messagebird').optional(),
    from: Joi.string().optional(),
  }),

  sendAlertSms: Joi.object({
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    alertType: Joi.string().min(1).max(50).required(),
    message: Joi.string().min(1).max(1600).required(),
    provider: Joi.string().valid('twilio', 'aws-sns', 'messagebird').optional(),
    from: Joi.string().optional(),
  }),

  getSmsLogs: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid('pending', 'sent', 'failed').optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    provider: Joi.string().valid('twilio', 'aws-sns', 'messagebird').optional(),
  }),

  getSmsLogById: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  getSmsStatistics: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),

  retryFailedSms: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  cleanupOldSmsLogs: Joi.object({
    daysOld: Joi.number().integer().min(1).max(365).optional(),
  }),

  getSmsLogsByPhone: Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  getSmsLogsByProvider: Joi.object({
    provider: Joi.string().valid('twilio', 'aws-sns', 'messagebird').required(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  getSmsLogsCountByStatus: Joi.object({}),

  deleteSmsLog: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

export default smsSchemas;
