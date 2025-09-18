import { dbConfig } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

class PushRepository {
  constructor() {
    this.dbConfig = dbConfig;
  }

  get prisma() {
    return this.dbConfig.getClient();
  }

  /**
   * Create a new push notification
   */
  async createPushNotification(notificationData) {
    try {
      const notification = await this.prisma.pushNotification.create({
        data: {
          tenantId: notificationData.tenantId,
          userId: notificationData.userId,
          title: notificationData.title,
          message: notificationData.message,
          isRead: notificationData.isRead || false,
          priority: notificationData.priority || 'normal',
        },
      });

      logger.debug('Push notification created:', { id: notification.id, userId: notification.userId });
      return notification;
    } catch (error) {
      logger.error('Failed to create push notification:', error);
      throw error;
    }
  }

  /**
   * Get push notification by ID
   */
  async getPushNotificationById(id) {
    try {
      const notification = await this.prisma.pushNotification.findUnique({
        where: { id },
        include: {
          tenant: true,
          user: true,
        },
      });

      return notification;
    } catch (error) {
      logger.error('Failed to get push notification by ID:', error);
      throw error;
    }
  }

  /**
   * Get push notifications with pagination and filters
   */
  async getPushNotifications(filters = {}, pagination = {}) {
    try {
      const {
        tenantId,
        userId,
        isRead,
        priority,
        startDate,
        endDate,
      } = filters;

      const {
        page = 1,
        limit = 10,
      } = pagination;

      const skip = (page - 1) * limit;

      const where = {
        ...(tenantId && { tenantId }),
        ...(userId && { userId }),
        ...(isRead !== undefined && { isRead }),
        ...(priority && { priority }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const [notifications, total] = await Promise.all([
        this.prisma.pushNotification.findMany({
          where,
          include: {
            tenant: true,
            user: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.pushNotification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get push notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    try {
      const notification = await this.prisma.pushNotification.update({
        where: { id },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      logger.debug('Push notification marked as read:', { id });
      return notification;
    } catch (error) {
      logger.error('Failed to mark push notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(ids) {
    try {
      const result = await this.prisma.pushNotification.updateMany({
        where: { id: { in: ids } },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      logger.debug('Multiple push notifications marked as read:', { count: result.count });
      return result;
    } catch (error) {
      logger.error('Failed to mark multiple push notifications as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsReadForUser(userId, tenantId) {
    try {
      const result = await this.prisma.pushNotification.updateMany({
        where: {
          userId,
          tenantId,
          isRead: false,
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      logger.debug('All push notifications marked as read for user:', { userId, count: result.count });
      return result;
    } catch (error) {
      logger.error('Failed to mark all push notifications as read for user:', error);
      throw error;
    }
  }

  /**
   * Get unread notifications count for a user
   */
  async getUnreadCount(userId, tenantId) {
    try {
      const count = await this.prisma.pushNotification.count({
        where: {
          userId,
          tenantId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      logger.error('Failed to get unread notifications count:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a specific user
   */
  async getNotificationsForUser(userId, tenantId, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
      } = pagination;

      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        this.prisma.pushNotification.findMany({
          where: {
            userId,
            tenantId,
          },
          include: {
            tenant: true,
            user: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.pushNotification.count({
          where: {
            userId,
            tenantId,
          },
        }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get notifications for user:', error);
      throw error;
    }
  }

  /**
   * Get push notification statistics
   */
  async getPushNotificationStatistics(tenantId, startDate, endDate) {
    try {
      const where = {
        tenantId,
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const [
        total,
        read,
        unread,
        highPriority,
        normalPriority,
      ] = await Promise.all([
        this.prisma.pushNotification.count({ where }),
        this.prisma.pushNotification.count({ where: { ...where, isRead: true } }),
        this.prisma.pushNotification.count({ where: { ...where, isRead: false } }),
        this.prisma.pushNotification.count({ where: { ...where, priority: 'high' } }),
        this.prisma.pushNotification.count({ where: { ...where, priority: 'normal' } }),
      ]);

      return {
        total,
        read,
        unread,
        highPriority,
        normalPriority,
        readRate: total > 0 ? ((read / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Failed to get push notification statistics:', error);
      throw error;
    }
  }

  /**
   * Delete push notification
   */
  async deletePushNotification(id) {
    try {
      await this.prisma.pushNotification.delete({
        where: { id },
      });

      logger.debug('Push notification deleted:', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete push notification:', error);
      throw error;
    }
  }

  /**
   * Delete multiple push notifications
   */
  async deleteMultiplePushNotifications(ids) {
    try {
      const result = await this.prisma.pushNotification.deleteMany({
        where: { id: { in: ids } },
      });

      logger.debug('Multiple push notifications deleted:', { count: result.count });
      return result;
    } catch (error) {
      logger.error('Failed to delete multiple push notifications:', error);
      throw error;
    }
  }

  /**
   * Clean up old push notifications
   */
  async cleanupOldPushNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await this.prisma.pushNotification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRead: true,
        },
      });

      logger.info('Old push notifications cleaned up:', { count: result.count, cutoffDate });
      return result;
    } catch (error) {
      logger.error('Failed to cleanup old push notifications:', error);
      throw error;
    }
  }

  /**
   * Get notifications by priority
   */
  async getNotificationsByPriority(priority, tenantId, limit = 100) {
    try {
      const notifications = await this.prisma.pushNotification.findMany({
        where: {
          priority,
          tenantId,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          tenant: true,
          user: true,
        },
      });

      return notifications;
    } catch (error) {
      logger.error('Failed to get notifications by priority:', error);
      throw error;
    }
  }

  /**
   * Get recent notifications for a user
   */
  async getRecentNotifications(userId, tenantId, limit = 5) {
    try {
      const notifications = await this.prisma.pushNotification.findMany({
        where: {
          userId,
          tenantId,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          tenant: true,
          user: true,
        },
      });

      return notifications;
    } catch (error) {
      logger.error('Failed to get recent notifications:', error);
      throw error;
    }
  }
}

// Create singleton instance
const pushRepository = new PushRepository();

export { pushRepository };
export default pushRepository;
