import Joi from 'joi';

/**
 * Push notification validation schemas
 */
export const pushSchemas = {
  sendPushNotification: Joi.object({
    userId: Joi.number().integer().positive().required(),
    title: Joi.string().min(1).max(100).required(),
    message: Joi.string().min(1).max(200).required(),
    data: Joi.object().optional(),
    provider: Joi.string().valid('firebase', 'apns', 'fcm').optional(),
    priority: Joi.string().valid('normal', 'high').optional(),
  }),

  sendBulkPushNotification: Joi.object({
    userIds: Joi.array().items(Joi.number().integer().positive()).min(1).max(1000).required(),
    title: Joi.string().min(1).max(100).required(),
    message: Joi.string().min(1).max(200).required(),
    data: Joi.object().optional(),
    provider: Joi.string().valid('firebase', 'apns', 'fcm').optional(),
    priority: Joi.string().valid('normal', 'high').optional(),
  }),

  sendPushNotificationToTopic: Joi.object({
    topic: Joi.string().min(1).max(100).required(),
    title: Joi.string().min(1).max(100).required(),
    message: Joi.string().min(1).max(200).required(),
    data: Joi.object().optional(),
    provider: Joi.string().valid('firebase', 'apns', 'fcm').optional(),
  }),

  subscribeToTopic: Joi.object({
    tokens: Joi.array().items(Joi.string()).min(1).max(1000).required(),
    topic: Joi.string().min(1).max(100).required(),
    provider: Joi.string().valid('firebase', 'apns', 'fcm').optional(),
  }),

  unsubscribeFromTopic: Joi.object({
    tokens: Joi.array().items(Joi.string()).min(1).max(1000).required(),
    topic: Joi.string().min(1).max(100).required(),
    provider: Joi.string().valid('firebase', 'apns', 'fcm').optional(),
  }),

  getPushNotifications: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    userId: Joi.number().integer().positive().optional(),
    isRead: Joi.boolean().optional(),
    priority: Joi.string().valid('normal', 'high').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),

  getPushNotificationById: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  getNotificationsForUser: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  markAsRead: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  markMultipleAsRead: Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).max(100).required(),
  }),

  markAllAsReadForUser: Joi.object({}),

  getUnreadCount: Joi.object({}),

  getPushNotificationStatistics: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),

  getNotificationsByPriority: Joi.object({
    priority: Joi.string().valid('normal', 'high').required(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  getRecentNotifications: Joi.object({
    limit: Joi.number().integer().min(1).max(50).optional(),
  }),

  sendSystemNotification: Joi.object({
    userIds: Joi.array().items(Joi.number().integer().positive()).min(1).max(1000).required(),
    title: Joi.string().min(1).max(100).required(),
    message: Joi.string().min(1).max(200).required(),
    data: Joi.object().optional(),
    provider: Joi.string().valid('firebase', 'apns', 'fcm').optional(),
    priority: Joi.string().valid('normal', 'high').optional(),
  }),

  sendAlertNotification: Joi.object({
    userIds: Joi.array().items(Joi.number().integer().positive()).min(1).max(1000).required(),
    alertType: Joi.string().min(1).max(50).required(),
    message: Joi.string().min(1).max(200).required(),
    data: Joi.object().optional(),
    provider: Joi.string().valid('firebase', 'apns', 'fcm').optional(),
  }),

  deletePushNotification: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  deleteMultiplePushNotifications: Joi.object({
    ids: Joi.array().items(Joi.number().integer().positive()).min(1).max(100).required(),
  }),

  cleanupOldPushNotifications: Joi.object({
    daysOld: Joi.number().integer().min(1).max(365).optional(),
  }),
};

export default pushSchemas;
