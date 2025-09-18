import { Router } from 'express';
import { pushController } from '../controllers/pushController.js';
import { validate } from '../../middlewares/validationMiddleware.js';
import { pushSchemas } from '../validations/pushValidation.js';
import { authenticateToken, authorize } from '../../middlewares/authMiddleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/push/send
 * @desc    Send push notification to specific users
 * @access  Private
 */
router.post('/send',
  validate(pushSchemas.sendPushNotification, 'body'),
  pushController.sendPushNotification
);

/**
 * @route   POST /api/push/send-bulk
 * @desc    Send push notification to multiple users
 * @access  Private
 */
router.post('/send-bulk',
  validate(pushSchemas.sendBulkPushNotification, 'body'),
  pushController.sendBulkPushNotification
);

/**
 * @route   POST /api/push/send-to-topic
 * @desc    Send push notification to topic
 * @access  Private
 */
router.post('/send-to-topic',
  validate(pushSchemas.sendPushNotificationToTopic, 'body'),
  pushController.sendPushNotificationToTopic
);

/**
 * @route   POST /api/push/subscribe-topic
 * @desc    Subscribe user to topic
 * @access  Private
 */
router.post('/subscribe-topic',
  validate(pushSchemas.subscribeToTopic, 'body'),
  pushController.subscribeToTopic
);

/**
 * @route   POST /api/push/unsubscribe-topic
 * @desc    Unsubscribe user from topic
 * @access  Private
 */
router.post('/unsubscribe-topic',
  validate(pushSchemas.unsubscribeFromTopic, 'body'),
  pushController.unsubscribeFromTopic
);

/**
 * @route   GET /api/push/notifications
 * @desc    Get push notifications with pagination and filters
 * @access  Private
 */
router.get('/notifications',
  validate(pushSchemas.getPushNotifications, 'query'),
  pushController.getPushNotifications
);

/**
 * @route   GET /api/push/notifications/:id
 * @desc    Get push notification by ID
 * @access  Private
 */
router.get('/notifications/:id',
  validate(pushSchemas.getPushNotificationById, 'params'),
  pushController.getPushNotificationById
);

/**
 * @route   GET /api/push/notifications/user/:userId
 * @desc    Get notifications for a specific user
 * @access  Private
 */
router.get('/notifications/user/:userId',
  validate(pushSchemas.getNotificationsForUser, 'query'),
  pushController.getNotificationsForUser
);

/**
 * @route   PATCH /api/push/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch('/notifications/:id/read',
  validate(pushSchemas.markAsRead, 'params'),
  pushController.markAsRead
);

/**
 * @route   PATCH /api/push/notifications/mark-multiple-read
 * @desc    Mark multiple notifications as read
 * @access  Private
 */
router.patch('/notifications/mark-multiple-read',
  validate(pushSchemas.markMultipleAsRead, 'body'),
  pushController.markMultipleAsRead
);

/**
 * @route   PATCH /api/push/notifications/mark-all-read
 * @desc    Mark all notifications as read for a user
 * @access  Private
 */
router.patch('/notifications/mark-all-read',
  validate(pushSchemas.markAllAsReadForUser, 'query'),
  pushController.markAllAsReadForUser
);

/**
 * @route   GET /api/push/notifications/unread-count
 * @desc    Get unread notifications count for a user
 * @access  Private
 */
router.get('/notifications/unread-count',
  validate(pushSchemas.getUnreadCount, 'query'),
  pushController.getUnreadCount
);

/**
 * @route   GET /api/push/statistics
 * @desc    Get push notification statistics
 * @access  Private
 */
router.get('/statistics',
  validate(pushSchemas.getPushNotificationStatistics, 'query'),
  pushController.getPushNotificationStatistics
);

/**
 * @route   GET /api/push/notifications/priority/:priority
 * @desc    Get notifications by priority
 * @access  Private
 */
router.get('/notifications/priority/:priority',
  validate(pushSchemas.getNotificationsByPriority, 'params'),
  validate(pushSchemas.getNotificationsByPriority, 'query'),
  pushController.getNotificationsByPriority
);

/**
 * @route   GET /api/push/notifications/recent
 * @desc    Get recent notifications for a user
 * @access  Private
 */
router.get('/notifications/recent',
  validate(pushSchemas.getRecentNotifications, 'query'),
  pushController.getRecentNotifications
);

/**
 * @route   POST /api/push/send-system
 * @desc    Send system notification
 * @access  Private (Admin only)
 */
router.post('/send-system',
  authorize('admin'),
  validate(pushSchemas.sendSystemNotification, 'body'),
  pushController.sendSystemNotification
);

/**
 * @route   POST /api/push/send-alert
 * @desc    Send alert notification
 * @access  Private (Admin only)
 */
router.post('/send-alert',
  authorize('admin'),
  validate(pushSchemas.sendAlertNotification, 'body'),
  pushController.sendAlertNotification
);

/**
 * @route   DELETE /api/push/notifications/:id
 * @desc    Delete push notification
 * @access  Private (Admin only)
 */
router.delete('/notifications/:id',
  authorize('admin'),
  validate(pushSchemas.deletePushNotification, 'params'),
  pushController.deletePushNotification
);

/**
 * @route   DELETE /api/push/notifications/delete-multiple
 * @desc    Delete multiple push notifications
 * @access  Private (Admin only)
 */
router.delete('/notifications/delete-multiple',
  authorize('admin'),
  validate(pushSchemas.deleteMultiplePushNotifications, 'body'),
  pushController.deleteMultiplePushNotifications
);

/**
 * @route   DELETE /api/push/cleanup
 * @desc    Clean up old push notifications
 * @access  Private (Admin only)
 */
router.delete('/cleanup',
  authorize('admin'),
  validate(pushSchemas.cleanupOldPushNotifications, 'query'),
  pushController.cleanupOldPushNotifications
);

/**
 * @route   GET /api/push/providers
 * @desc    Get supported push notification providers
 * @access  Private
 */
router.get('/providers',
  pushController.getSupportedProviders
);

export default router;
