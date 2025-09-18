import { smsRepository } from '../repositories/smsRepository.js';
import { smsConfig } from '../../config/sms.js';
import { logger } from '../../utils/logger.js';

class SmsService {
  constructor() {
    this.smsRepository = smsRepository;
    this.smsConfig = smsConfig;
  }

  /**
   * Send a single SMS
   */
  async sendSms(smsData) {
    try {
      const { tenantId, phoneNumber, message, provider, ...options } = smsData;

      // Create SMS log
      const smsLog = await this.smsRepository.createSmsLog({
        tenantId,
        phone: phoneNumber,
        message,
        status: 'pending',
        provider,
      });

      try {
        // Send SMS
        const result = await this.smsConfig.sendSms({
          phoneNumber,
          message,
          provider,
          ...options,
        });

        // Update SMS log status
        await this.smsRepository.updateSmsLogStatus(
          smsLog.id,
          'sent',
          null
        );

        logger.info('SMS sent successfully', {
          smsLogId: smsLog.id,
          phoneNumber,
          provider: result.provider,
          messageId: result.messageId,
        });

        return {
          success: true,
          smsLogId: smsLog.id,
          messageId: result.messageId,
          provider: result.provider,
        };
      } catch (error) {
        // Update SMS log status to failed
        await this.smsRepository.updateSmsLogStatus(
          smsLog.id,
          'failed',
          error.message
        );

        logger.error('Failed to send SMS:', {
          smsLogId: smsLog.id,
          phoneNumber,
          error: error.message,
        });

        throw error;
      }
    } catch (error) {
      logger.error('SMS service error:', error);
      throw error;
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSms(smsData) {
    try {
      const { phoneNumbers, message, tenantId, provider, batchSize = 10, delay = 1000 } = smsData;

      const results = [];
      const batchPromises = [];

      // Process SMS in batches
      for (let i = 0; i < phoneNumbers.length; i += batchSize) {
        const batch = phoneNumbers.slice(i, i + batchSize);
        
        const batchPromise = this.processSmsBatch(batch, message, tenantId, provider);
        batchPromises.push(batchPromise);

        // Add delay between batches
        if (i + batchSize < phoneNumbers.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      logger.info('Bulk SMS sending completed', {
        total: phoneNumbers.length,
        successful,
        failed,
      });

      return {
        success: true,
        results,
        summary: { total: phoneNumbers.length, successful, failed },
      };
    } catch (error) {
      logger.error('Bulk SMS service error:', error);
      throw error;
    }
  }

  /**
   * Process a batch of SMS
   */
  async processSmsBatch(phoneNumbers, message, tenantId, provider) {
    const results = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        const result = await this.sendSms({
          tenantId,
          phoneNumber,
          message,
          provider,
        });
        results.push({ phoneNumber, ...result });
      } catch (error) {
        results.push({
          phoneNumber,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Send SMS notification
   */
  async sendSmsNotification(notificationData) {
    try {
      const { tenantId, phoneNumber, message, ...options } = notificationData;

      return await this.sendSms({
        tenantId,
        phoneNumber,
        message,
        ...options,
      });
    } catch (error) {
      logger.error('SMS notification service error:', error);
      throw error;
    }
  }

  /**
   * Send verification SMS
   */
  async sendVerificationSms(userData) {
    try {
      const { tenantId, phoneNumber, verificationCode, ...options } = userData;

      const message = `Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`;

      return await this.sendSms({
        tenantId,
        phoneNumber,
        message,
        ...options,
      });
    } catch (error) {
      logger.error('Verification SMS service error:', error);
      throw error;
    }
  }

  /**
   * Send alert SMS
   */
  async sendAlertSms(alertData) {
    try {
      const { tenantId, phoneNumber, alertType, message, ...options } = alertData;

      const alertMessage = `ALERT [${alertType.toUpperCase()}]: ${message}`;

      return await this.sendSms({
        tenantId,
        phoneNumber,
        message: alertMessage,
        ...options,
      });
    } catch (error) {
      logger.error('Alert SMS service error:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs
   */
  async getSmsLogs(filters, pagination) {
    try {
      return await this.smsRepository.getSmsLogs(filters, pagination);
    } catch (error) {
      logger.error('Get SMS logs service error:', error);
      throw error;
    }
  }

  /**
   * Get SMS log by ID
   */
  async getSmsLogById(id) {
    try {
      return await this.smsRepository.getSmsLogById(id);
    } catch (error) {
      logger.error('Get SMS log by ID service error:', error);
      throw error;
    }
  }

  /**
   * Get SMS statistics
   */
  async getSmsStatistics(tenantId, startDate, endDate) {
    try {
      return await this.smsRepository.getSmsStatistics(tenantId, startDate, endDate);
    } catch (error) {
      logger.error('Get SMS statistics service error:', error);
      throw error;
    }
  }

  /**
   * Retry failed SMS
   */
  async retryFailedSms(limit = 50) {
    try {
      const failedSms = await this.smsRepository.getFailedSmsLogsForRetry(limit);
      const results = [];

      for (const smsLog of failedSms) {
        try {
          // Reset status to pending
          await this.smsRepository.updateSmsLogStatus(smsLog.id, 'pending');

          // Retry sending
          const result = await this.smsConfig.sendSms({
            phoneNumber: smsLog.phone,
            message: smsLog.message,
            provider: smsLog.provider,
          });

          // Update status to sent
          await this.smsRepository.updateSmsLogStatus(
            smsLog.id,
            'sent',
            null
          );

          results.push({
            smsLogId: smsLog.id,
            success: true,
            messageId: result.messageId,
          });
        } catch (error) {
          // Update status to failed again
          await this.smsRepository.updateSmsLogStatus(
            smsLog.id,
            'failed',
            error.message
          );

          results.push({
            smsLogId: smsLog.id,
            success: false,
            error: error.message,
          });
        }
      }

      logger.info('Failed SMS retry completed', {
        total: failedSms.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      });

      return results;
    } catch (error) {
      logger.error('Retry failed SMS service error:', error);
      throw error;
    }
  }

  /**
   * Clean up old SMS logs
   */
  async cleanupOldSmsLogs(daysOld = 90) {
    try {
      return await this.smsRepository.cleanupOldSmsLogs(daysOld);
    } catch (error) {
      logger.error('Cleanup old SMS logs service error:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs by phone number
   */
  async getSmsLogsByPhone(phone, tenantId, limit = 50) {
    try {
      return await this.smsRepository.getSmsLogsByPhone(phone, tenantId, limit);
    } catch (error) {
      logger.error('Get SMS logs by phone service error:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs by provider
   */
  async getSmsLogsByProvider(provider, tenantId, limit = 100) {
    try {
      return await this.smsRepository.getSmsLogsByProvider(provider, tenantId, limit);
    } catch (error) {
      logger.error('Get SMS logs by provider service error:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs count by status
   */
  async getSmsLogsCountByStatus(tenantId) {
    try {
      return await this.smsRepository.getSmsLogsCountByStatus(tenantId);
    } catch (error) {
      logger.error('Get SMS logs count by status service error:', error);
      throw error;
    }
  }

  /**
   * Delete SMS log
   */
  async deleteSmsLog(id) {
    try {
      return await this.smsRepository.deleteSmsLog(id);
    } catch (error) {
      logger.error('Delete SMS log service error:', error);
      throw error;
    }
  }

  /**
   * Get supported SMS providers
   */
  getSupportedProviders() {
    return this.smsConfig.getSupportedProviders();
  }
}

// Create singleton instance
const smsService = new SmsService();

export { smsService };
export default smsService;
