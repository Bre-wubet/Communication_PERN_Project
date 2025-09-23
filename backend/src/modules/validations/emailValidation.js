import Joi from 'joi';

/**
 * Email validation schemas
 */
export const emailSchemas = {
  sendEmail: Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().min(1).max(200).required(),
    body: Joi.string().min(1).required(),
    html: Joi.string().optional(),
    provider: Joi.string().valid('smtp', 'gmail', 'sendgrid', 'mailgun').optional(),
    from: Joi.string().email().optional(),
    replyTo: Joi.string().email().optional(),
    cc: Joi.array().items(Joi.string().email()).optional(),
    bcc: Joi.array().items(Joi.string().email()).optional(),
    attachments: Joi.array().items(
      Joi.object({
        filename: Joi.string().required(),
        content: Joi.string().required(),
        contentType: Joi.string().optional(),
      })
    ).optional(),
  }),

  sendBulkEmail: Joi.object({
    emails: Joi.array().items(
      Joi.object({
        to: Joi.string().email().required(),
        subject: Joi.string().min(1).max(200).required(),
        body: Joi.string().min(1).required(),
        html: Joi.string().optional(),
      })
    ).min(1).max(100).required(),
    provider: Joi.string().valid('smtp', 'gmail', 'sendgrid', 'mailgun').optional(),
    batchSize: Joi.number().integer().min(1).max(50).optional(),
    delay: Joi.number().integer().min(100).max(10000).optional(),
  }),

  sendTemplatedEmail: Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().min(1).max(200).required(),
    template: Joi.string().min(1).max(50).required(),
    data: Joi.object().optional(),
    provider: Joi.string().valid('smtp', 'gmail', 'sendgrid', 'mailgun').optional(),
    from: Joi.string().email().optional(),
    replyTo: Joi.string().email().optional(),
    cc: Joi.array().items(Joi.string().email()).optional(),
    bcc: Joi.array().items(Joi.string().email()).optional(),
  }),

  sendWelcomeEmail: Joi.object({
    to: Joi.string().email().required(),
    name: Joi.string().min(1).max(100).required(),
    subject: Joi.string().min(1).max(200).optional(),
    template: Joi.string().min(1).max(50).optional(),
    data: Joi.object().optional(),
    provider: Joi.string().valid('smtp', 'gmail', 'sendgrid', 'mailgun').optional(),
  }),

  sendPasswordResetEmail: Joi.object({
    to: Joi.string().email().required(),
    resetToken: Joi.string().min(1).required(),
    baseUrl: Joi.string().uri().required(),
    subject: Joi.string().min(1).max(200).optional(),
    template: Joi.string().min(1).max(50).optional(),
    data: Joi.object().optional(),
    provider: Joi.string().valid('smtp', 'gmail', 'sendgrid', 'mailgun').optional(),
  }),

  sendNotificationEmail: Joi.object({
    to: Joi.string().email().required(),
    title: Joi.string().min(1).max(100).required(),
    message: Joi.string().min(1).max(500).required(),
    subject: Joi.string().min(1).max(200).optional(),
    template: Joi.string().min(1).max(50).optional(),
    data: Joi.object().optional(),
    provider: Joi.string().valid('smtp', 'gmail', 'sendgrid', 'mailgun').optional(),
  }),

  getEmailLogs: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid('pending', 'sent', 'failed').optional(),
    to: Joi.string().email().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    provider: Joi.string().valid('smtp', 'gmail', 'sendgrid', 'mailgun').optional(),
  }),

  getEmailLogById: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  getEmailStatistics: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),

  retryFailedEmails: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  cleanupOldEmailLogs: Joi.object({
    daysOld: Joi.number().integer().min(1).max(365).optional(),
  }),

  getEmailLogsByRecipient: Joi.object({
    to: Joi.string().email().required(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  deleteEmailLog: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};

export default emailSchemas;
