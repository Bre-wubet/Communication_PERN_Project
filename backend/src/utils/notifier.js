import { smsConfig } from '../config/sms.js';
import { pushConfig } from '../config/push.js';
import { mailer } from './mailer.js';
import { logger } from './logger.js';

class Notifier {
  constructor() {
    this.smsConfig = smsConfig;
    this.pushConfig = pushConfig;
    this.mailer = mailer;
  }

  /**
   * Send notification via multiple channels
   */
  async sendNotification(notification, options = {}) {
    try {
      const results = [];
      const channels = options.channels || ['email', 'sms', 'push'];

      for (const channel of channels) {
        try {
          let result;
          
          switch (channel) {
            case 'email':
              result = await this.sendEmailNotification(notification, options);
              break;
            case 'sms':
              result = await this.sendSmsNotification(notification, options);
              break;
            case 'push':
              result = await this.sendPushNotification(notification, options);
              break;
            default:
              logger.warn(`Unsupported notification channel: ${channel}`);
              continue;
          }

          results.push({ channel, ...result });
        } catch (error) {
          logger.error(`Failed to send ${channel} notification:`, error);
          results.push({ 
            channel, 
            success: false, 
            error: error.message 
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      logger.info(`Notification sent via ${successful} channels`, {
        total: channels.length,
        successful,
        failed,
        results,
      });

      return {
        success: successful > 0,
        results,
        summary: { total: channels.length, successful, failed },
      };
    } catch (error) {
      logger.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification, options = {}) {
    try {
      const { to, subject, message, template, data } = notification;
      
      if (template) {
        return await this.mailer.sendTemplatedEmail(to, subject, template, data, options);
      } else {
        return await this.mailer.sendHtmlEmail(to, subject, message, options);
      }
    } catch (error) {
      logger.error('Failed to send email notification:', error);
      throw error;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSmsNotification(notification, options = {}) {
    try {
      const { phoneNumber, message } = notification;
      
      return await this.smsConfig.sendSms({
        phoneNumber,
        message,
        provider: options.smsProvider,
        ...options.smsOptions,
      });
    } catch (error) {
      logger.error('Failed to send SMS notification:', error);
      throw error;
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(notification, options = {}) {
    try {
      const { tokens, title, body, data, topic } = notification;
      
      if (topic) {
        return await this.pushConfig.sendToTopic({
          topic,
          title,
          body,
          data,
          provider: options.pushProvider,
          ...options.pushOptions,
        });
      } else {
        return await this.pushConfig.sendNotification({
          tokens,
          title,
          body,
          data,
          provider: options.pushProvider,
          ...options.pushOptions,
        });
      }
    } catch (error) {
      logger.error('Failed to send push notification:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications, options = {}) {
    try {
      const results = [];
      const batchSize = options.batchSize || 10;
      const delay = options.delay || 1000;

      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (notification) => {
          try {
            return await this.sendNotification(notification, options);
          } catch (error) {
            logger.error(`Failed to send bulk notification:`, error);
            return { success: false, error: error.message };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add delay between batches
        if (i + batchSize < notifications.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      logger.info(`Bulk notification sending completed`, {
        total: notifications.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      });

      return results;
    } catch (error) {
      logger.error('Failed to send bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Send comment notification
   */
  async sendCommentNotification(comment, options = {}) {
    try {
      const { commenterName, commentContent, mentionedUsers = [] } = comment;
      
      const notifications = [];

      // Notify mentioned users
      for (const user of mentionedUsers) {
        notifications.push({
          channels: ['email', 'push'],
          email: {
            to: user.email,
            subject: `You were mentioned in a comment by ${commenterName}`,
            template: 'mention-notification',
            data: {
              mentionedBy: commenterName,
              content: commentContent,
              commenterName,
            },
          },
          push: {
            tokens: user.pushTokens || [],
            title: 'You were mentioned',
            body: `${commenterName} mentioned you in a comment`,
            data: {
              type: 'mention',
              commentId: comment.id,
            },
          },
        });
      }

      // Send notifications
      if (notifications.length > 0) {
        return await this.sendBulkNotifications(notifications, options);
      }

      return { success: true, message: 'No notifications to send' };
    } catch (error) {
      logger.error('Failed to send comment notification:', error);
      throw error;
    }
  }

  /**
   * Send reply notification
   */
  async sendReplyNotification(reply, options = {}) {
    try {
      const { replierName, replyContent, originalCommenter } = reply;
      
      const notification = {
        channels: ['email', 'push'],
        email: {
          to: originalCommenter.email,
          subject: `New reply from ${replierName}`,
          template: 'reply-notification',
          data: {
            replierName,
            content: replyContent,
          },
        },
        push: {
          tokens: originalCommenter.pushTokens || [],
          title: 'New reply',
          body: `${replierName} replied to your comment`,
          data: {
            type: 'reply',
            replyId: reply.id,
          },
        },
      };

      return await this.sendNotification(notification, options);
    } catch (error) {
      logger.error('Failed to send reply notification:', error);
      throw error;
    }
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(users, notification, options = {}) {
    try {
      const notifications = users.map(user => ({
        channels: ['email', 'push'],
        email: {
          to: user.email,
          subject: notification.subject,
          template: 'system-notification',
          data: {
            title: notification.title,
            message: notification.message,
            ...notification.data,
          },
        },
        push: {
          tokens: user.pushTokens || [],
          title: notification.title,
          body: notification.message,
          data: {
            type: 'system',
            ...notification.data,
          },
        },
      }));

      return await this.sendBulkNotifications(notifications, options);
    } catch (error) {
      logger.error('Failed to send system notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(tokens, topic, provider = null) {
    try {
      return await this.pushConfig.subscribeToTopic(tokens, topic, provider);
    } catch (error) {
      logger.error('Failed to subscribe to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from topic
   */
  async unsubscribeFromTopic(tokens, topic, provider = null) {
    try {
      return await this.pushConfig.unsubscribeFromTopic(tokens, topic, provider);
    } catch (error) {
      logger.error('Failed to unsubscribe from topic:', error);
      throw error;
    }
  }

  /**
   * Get supported providers for each channel
   */
  getSupportedProviders() {
    return {
      email: this.mailer.getSupportedProviders(),
      sms: this.smsConfig.getSupportedProviders(),
      push: this.pushConfig.getSupportedProviders(),
    };
  }
}

// Create singleton instance
const notifier = new Notifier();

export { notifier };
export default notifier;
