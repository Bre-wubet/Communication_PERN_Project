import { pushRepository } from '../repositories/pushRepository.js';
import { pushConfig } from '../../config/push.js';
import { logger } from '../../utils/logger.js';

class PushService {
  constructor() {
    this.pushRepository = pushRepository;
    this.pushConfig = pushConfig;
  }

  /**
   * Send push notification to specific users
   */
  async sendPushNotification(notificationData) {
    try {
      const { tenantId, userId, title, message, data, priority, provider, ...options } = notificationData;

      // Create push notification record
      const notification = await this.pushRepository.createPushNotification({
        tenantId,
        userId,
        title,
        message,
        priority: priority || 'normal',
      });

      try {
        // Send push notification
        const result = await this.pushConfig.sendNotification({
          tokens: [userId], // Assuming userId is the device token
          title,
          body: message,
          data,
          provider,
          ...options,
        });

        logger.info('Push notification sent successfully', {
          notificationId: notification.id,
          userId,
          provider: result.provider,
        });

        return {
          success: true,
          notificationId: notification.id,
          result: result.result,
          provider: result.provider,
        };
      } catch (error) {
        logger.error('Failed to send push notification:', {
          notificationId: notification.id,
          userId,
          error: error.message,
        });

        // Note: We don't update the notification status here as it's a database record
        // The actual sending failure doesn't affect the notification record
        throw error;
      }
    } catch (error) {
      logger.error('Push notification service error:', error);
      throw error;
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendBulkPushNotification(notificationData) {
    try {
      const { tenantId, userIds, title, message, data, priority, provider, ...options } = notificationData;

      const results = [];
      const notifications = [];

      // Create notification records for all users
      for (const userId of userIds) {
        try {
          const notification = await this.pushRepository.createPushNotification({
            tenantId,
            userId,
            title,
            message,
            priority: priority || 'normal',
          });
          notifications.push(notification);
        } catch (error) {
          logger.error('Failed to create notification record:', { userId, error: error.message });
          results.push({
            userId,
            success: false,
            error: 'Failed to create notification record',
          });
        }
      }

      try {
        // Send push notification to all users
        const result = await this.pushConfig.sendNotification({
          tokens: userIds,
          title,
          body: message,
          data,
          provider,
          ...options,
        });

        // Mark all notifications as sent (assuming success)
        for (const notification of notifications) {
          results.push({
            notificationId: notification.id,
            userId: notification.userId,
            success: true,
            provider: result.provider,
          });
        }

        logger.info('Bulk push notification sent successfully', {
          total: userIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
        });

        return {
          success: true,
          results,
          summary: {
            total: userIds.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
          },
        };
      } catch (error) {
        logger.error('Failed to send bulk push notification:', error);
        throw error;
      }
    } catch (error) {
      logger.error('Bulk push notification service error:', error);
      throw error;
    }
  }

  /**
   * Send push notification to topic
   */
  async sendPushNotificationToTopic(notificationData) {
    try {
      const { tenantId, topic, title, message, data, provider, ...options } = notificationData;

      // Send push notification to topic
      const result = await this.pushConfig.sendToTopic({
        topic,
        title,
        body: message,
        data,
        provider,
        ...options,
      });

      logger.info('Push notification sent to topic successfully', {
        topic,
        provider: result.provider,
      });

      return {
        success: true,
        result: result.result,
        provider: result.provider,
      };
    } catch (error) {
      logger.error('Push notification to topic service error:', error);
      throw error;
    }
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(topicData) {
    try {
      const { tokens, topic, provider } = topicData;

      const result = await this.pushConfig.subscribeToTopic(tokens, topic, provider);

      logger.info('User subscribed to topic successfully', {
        topic,
        tokensCount: tokens.length,
        provider,
      });

      return {
        success: true,
        result,
      };
    } catch (error) {
      logger.error('Subscribe to topic service error:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from topic
   */
  async unsubscribeFromTopic(topicData) {
    try {
      const { tokens, topic, provider } = topicData;

      const result = await this.pushConfig.unsubscribeFromTopic(tokens, topic, provider);

      logger.info('User unsubscribed from topic successfully', {
        topic,
        tokensCount: tokens.length,
        provider,
      });

      return {
        success: true,
        result,
      };
    } catch (error) {
      logger.error('Unsubscribe from topic service error:', error);
      throw error;
    }
  }

  /**
   * Get push notifications
   */
  async getPushNotifications(filters, pagination) {
    try {
      return await this.pushRepository.getPushNotifications(filters, pagination);
    } catch (error) {
      logger.error('Get push notifications service error:', error);
      throw error;
    }
  }

  /**
   * Get push notification by ID
   */
  async getPushNotificationById(id) {
    try {
      return await this.pushRepository.getPushNotificationById(id);
    } catch (error) {
      logger.error('Get push notification by ID service error:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific user
   */
  async getNotificationsForUser(userId, tenantId, pagination) {
    try {
      return await this.pushRepository.getNotificationsForUser(userId, tenantId, pagination);
    } catch (error) {
      logger.error('Get notifications for user service error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    try {
      return await this.pushRepository.markAsRead(id);
    } catch (error) {
      logger.error('Mark notification as read service error:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(ids) {
    try {
      return await this.pushRepository.markMultipleAsRead(ids);
    } catch (error) {
      logger.error('Mark multiple notifications as read service error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsReadForUser(userId, tenantId) {
    try {
      return await this.pushRepository.markAllAsReadForUser(userId, tenantId);
    } catch (error) {
      logger.error('Mark all notifications as read for user service error:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count for a user
   */
  async getUnreadCount(userId, tenantId) {
    try {
      return await this.pushRepository.getUnreadCount(userId, tenantId);
    } catch (error) {
      logger.error('Get unread notifications count service error:', error);
      throw error;
    }
  }

  /**
   * Get push notification statistics
   */
  async getPushNotificationStatistics(tenantId, startDate, endDate) {
    try {
      return await this.pushRepository.getPushNotificationStatistics(tenantId, startDate, endDate);
    } catch (error) {
      logger.error('Get push notification statistics service error:', error);
      throw error;
    }
  }

  /**
   * Get notifications by priority
   */
  async getNotificationsByPriority(priority, tenantId, limit = 100) {
    try {
      return await this.pushRepository.getNotificationsByPriority(priority, tenantId, limit);
    } catch (error) {
      logger.error('Get notifications by priority service error:', error);
      throw error;
    }
  }

  /**
   * Get recent notifications for a user
   */
  async getRecentNotifications(userId, tenantId, limit = 5) {
    try {
      return await this.pushRepository.getRecentNotifications(userId, tenantId, limit);
    } catch (error) {
      logger.error('Get recent notifications service error:', error);
      throw error;
    }
  }

  /**
   * Delete push notification
   */
  async deletePushNotification(id) {
    try {
      return await this.pushRepository.deletePushNotification(id);
    } catch (error) {
      logger.error('Delete push notification service error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple push notifications
   */
  async deleteMultiplePushNotifications(ids) {
    try {
      return await this.pushRepository.deleteMultiplePushNotifications(ids);
    } catch (error) {
      logger.error('Delete multiple push notifications service error:', error);
      throw error;
    }
  }

  /**
   * Clean up old push notifications
   */
  async cleanupOldPushNotifications(daysOld = 30) {
    try {
      return await this.pushRepository.cleanupOldPushNotifications(daysOld);
    } catch (error) {
      logger.error('Cleanup old push notifications service error:', error);
      throw error;
    }
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(notificationData) {
    try {
      const { tenantId, userIds, title, message, data, priority, provider, ...options } = notificationData;

      return await this.sendBulkPushNotification({
        tenantId,
        userIds,
        title,
        message,
        data,
        priority: priority || 'normal',
        provider,
        ...options,
      });
    } catch (error) {
      logger.error('System notification service error:', error);
      throw error;
    }
  }

  /**
   * Send alert notification
   */
  async sendAlertNotification(alertData) {
    try {
      const { tenantId, userIds, alertType, message, data, provider, ...options } = alertData;

      const title = `ALERT: ${alertType.toUpperCase()}`;
      const alertMessage = `[${alertType.toUpperCase()}] ${message}`;

      return await this.sendBulkPushNotification({
        tenantId,
        userIds,
        title,
        message: alertMessage,
        data: {
          ...data,
          alertType,
          priority: 'high',
        },
        priority: 'high',
        provider,
        ...options,
      });
    } catch (error) {
      logger.error('Alert notification service error:', error);
      throw error;
    }
  }

  /**
   * Get supported push notification providers
   */
  getSupportedProviders() {
    return this.pushConfig.getSupportedProviders();
  }
}

// Create singleton instance
const pushService = new PushService();

export { pushService };
export default pushService;
