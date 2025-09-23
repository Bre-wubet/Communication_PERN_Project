import { pushService } from '../services/pushService.js';
import { logger } from '../../utils/logger.js';
import { asyncHandler } from '../../middlewares/errorMiddleware.js';

class PushController {
  constructor() {
    this.pushService = pushService;
  }

  /**
   * Send push notification to specific users
   */
  sendPushNotification = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const notificationData = {
        ...req.body,
        tenantId,
        userId,
      };

      const result = await this.pushService.sendPushNotification(notificationData);

      res.status(200).json({
        success: true,
        message: 'Push notification sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send push notification controller error:', error);
      throw error;
    }
  });

  /**
   * Send push notification to multiple users
   */
  sendBulkPushNotification = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const notificationData = {
        ...req.body,
        tenantId,
      };

      const result = await this.pushService.sendBulkPushNotification(notificationData);

      res.status(200).json({
        success: true,
        message: 'Bulk push notification sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send bulk push notification controller error:', error);
      throw error;
    }
  });

  /**
   * Send push notification to topic
   */
  sendPushNotificationToTopic = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const notificationData = {
        ...req.body,
        tenantId,
      };

      const result = await this.pushService.sendPushNotificationToTopic(notificationData);

      res.status(200).json({
        success: true,
        message: 'Push notification sent to topic successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send push notification to topic controller error:', error);
      throw error;
    }
  });

  /**
   * Subscribe user to topic
   */
  subscribeToTopic = asyncHandler(async (req, res) => {
    try {
      const topicData = req.body;
      const result = await this.pushService.subscribeToTopic(topicData);

      res.status(200).json({
        success: true,
        message: 'User subscribed to topic successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Subscribe to topic controller error:', error);
      throw error;
    }
  });

  /**
   * Unsubscribe user from topic
   */
  unsubscribeFromTopic = asyncHandler(async (req, res) => {
    try {
      const topicData = req.body;
      const result = await this.pushService.unsubscribeFromTopic(topicData);

      res.status(200).json({
        success: true,
        message: 'User unsubscribed from topic successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Unsubscribe from topic controller error:', error);
      throw error;
    }
  });

  /**
   * Get push notifications
   */
  getPushNotifications = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const filters = {
        ...req.query,
        tenantId,
      };
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await this.pushService.getPushNotifications(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Push notifications retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get push notifications controller error:', error);
      throw error;
    }
  });

  /**
   * Get push notification by ID
   */
  getPushNotificationById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.pushService.getPushNotificationById(parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Push notification not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Push notification retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get push notification by ID controller error:', error);
      throw error;
    }
  });

  /**
   * Get notifications for a specific user
   */
  getNotificationsForUser = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await this.pushService.getNotificationsForUser(
        userId,
        tenantId,
        pagination
      );

      res.status(200).json({
        success: true,
        message: 'User notifications retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get notifications for user controller error:', error);
      throw error;
    }
  });

  /**
   * Mark notification as read
   */
  markAsRead = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.pushService.markAsRead(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Notification marked as read successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Mark notification as read controller error:', error);
      throw error;
    }
  });

  /**
   * Mark multiple notifications as read
   */
  markMultipleAsRead = asyncHandler(async (req, res) => {
    try {
      const { ids } = req.body;
      const result = await this.pushService.markMultipleAsRead(ids);

      res.status(200).json({
        success: true,
        message: 'Multiple notifications marked as read successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Mark multiple notifications as read controller error:', error);
      throw error;
    }
  });

  /**
   * Mark all notifications as read for a user
   */
  markAllAsReadForUser = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const result = await this.pushService.markAllAsReadForUser(userId, tenantId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Mark all notifications as read for user controller error:', error);
      throw error;
    }
  });

  /**
   * Get unread notifications count for a user
   */
  getUnreadCount = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const count = await this.pushService.getUnreadCount(userId, tenantId);

      res.status(200).json({
        success: true,
        message: 'Unread notifications count retrieved successfully',
        data: { count },
      });
    } catch (error) {
      logger.error('Get unread notifications count controller error:', error);
      throw error;
    }
  });

  /**
   * Get push notification statistics
   */
  getPushNotificationStatistics = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { startDate, endDate } = req.query;

      const result = await this.pushService.getPushNotificationStatistics(
        tenantId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        message: 'Push notification statistics retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get push notification statistics controller error:', error);
      throw error;
    }
  });

  /**
   * Get notifications by priority
   */
  getNotificationsByPriority = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { priority } = req.params;
      const { limit } = req.query;

      const result = await this.pushService.getNotificationsByPriority(
        priority,
        tenantId,
        parseInt(limit) || 100
      );

      res.status(200).json({
        success: true,
        message: 'Notifications by priority retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get notifications by priority controller error:', error);
      throw error;
    }
  });

  /**
   * Get recent notifications for a user
   */
  getRecentNotifications = asyncHandler(async (req, res) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { limit } = req.query;

      const result = await this.pushService.getRecentNotifications(
        userId,
        tenantId,
        parseInt(limit) || 5
      );

      res.status(200).json({
        success: true,
        message: 'Recent notifications retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get recent notifications controller error:', error);
      throw error;
    }
  });

  /**
   * Send system notification
   */
  sendSystemNotification = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const notificationData = {
        ...req.body,
        tenantId,
      };

      const result = await this.pushService.sendSystemNotification(notificationData);

      res.status(200).json({
        success: true,
        message: 'System notification sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send system notification controller error:', error);
      throw error;
    }
  });

  /**
   * Send alert notification
   */
  sendAlertNotification = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const alertData = {
        ...req.body,
        tenantId,
      };

      const result = await this.pushService.sendAlertNotification(alertData);

      res.status(200).json({
        success: true,
        message: 'Alert notification sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send alert notification controller error:', error);
      throw error;
    }
  });

  /**
   * Delete push notification
   */
  deletePushNotification = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.pushService.deletePushNotification(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Push notification deleted successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Delete push notification controller error:', error);
      throw error;
    }
  });

  /**
   * Delete multiple push notifications
   */
  deleteMultiplePushNotifications = asyncHandler(async (req, res) => {
    try {
      const { ids } = req.body;
      const result = await this.pushService.deleteMultiplePushNotifications(ids);

      res.status(200).json({
        success: true,
        message: 'Multiple push notifications deleted successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Delete multiple push notifications controller error:', error);
      throw error;
    }
  });

  /**
   * Clean up old push notifications
   */
  cleanupOldPushNotifications = asyncHandler(async (req, res) => {
    try {
      const { daysOld } = req.query;
      const result = await this.pushService.cleanupOldPushNotifications(
        parseInt(daysOld) || 30
      );

      res.status(200).json({
        success: true,
        message: 'Old push notifications cleaned up successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Cleanup old push notifications controller error:', error);
      throw error;
    }
  });

  /**
   * Get supported push notification providers
   */
  getSupportedProviders = asyncHandler(async (req, res) => {
    try {
      const providers = this.pushService.getSupportedProviders();

      res.status(200).json({
        success: true,
        message: 'Supported push notification providers retrieved successfully',
        data: { providers },
      });
    } catch (error) {
      logger.error('Get supported push notification providers controller error:', error);
      throw error;
    }
  });
}

// Create singleton instance
const pushController = new PushController();

export { pushController };
export default pushController;
