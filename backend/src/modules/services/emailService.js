import { emailRepository } from '../repositories/emailRepository.js';
import { emailConfig } from '../../config/email.js';
import { mailer } from '../../utils/mailer.js';
import { logger } from '../../utils/logger.js';

class EmailService {
  constructor() {
    this.emailRepository = emailRepository;
    this.emailConfig = emailConfig;
    this.mailer = mailer;
  }

  /**
   * Send a single email
   */
  async sendEmail(emailData) {
    try {
      const { tenantId, to, subject, body, html, provider, ...options } = emailData;

      // Create email log
      const emailLog = await this.emailRepository.createEmailLog({
        tenantId,
        to,
        subject,
        body,
        status: 'pending',
        provider,
      });

      try {
        // Send email
        const result = await this.emailConfig.sendEmail({
          to,
          subject,
          body,
          html,
          provider,
          ...options,
        });

        // Update email log status
        await this.emailRepository.updateEmailLogStatus(
          emailLog.id,
          'sent',
          null
        );

        logger.info('Email sent successfully', {
          emailLogId: emailLog.id,
          to,
          provider: result.provider,
          messageId: result.messageId,
        });

        return {
          success: true,
          emailLogId: emailLog.id,
          messageId: result.messageId,
          provider: result.provider,
        };
      } catch (error) {
        // Update email log status to failed
        await this.emailRepository.updateEmailLogStatus(
          emailLog.id,
          'failed',
          error.message
        );

        logger.error('Failed to send email:', {
          emailLogId: emailLog.id,
          to,
          error: error.message,
        });

        throw error;
      }
    } catch (error) {
      logger.error('Email service error:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emailsData) {
    try {
      const { emails, tenantId, provider, batchSize = 10, delay = 1000 } = emailsData;

      const results = [];
      const batchPromises = [];

      // Process emails in batches
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        const batchPromise = this.processEmailBatch(batch, tenantId, provider);
        batchPromises.push(batchPromise);

        // Add delay between batches
        if (i + batchSize < emails.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      logger.info('Bulk email sending completed', {
        total: emails.length,
        successful,
        failed,
      });

      return {
        success: true,
        results,
        summary: { total: emails.length, successful, failed },
      };
    } catch (error) {
      logger.error('Bulk email service error:', error);
      throw error;
    }
  }

  /**
   * Process a batch of emails
   */
  async processEmailBatch(emails, tenantId, provider) {
    const results = [];

    for (const email of emails) {
      try {
        const result = await this.sendEmail({
          ...email,
          tenantId,
          provider,
        });
        results.push({ ...email, ...result });
      } catch (error) {
        results.push({
          ...email,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Send templated email
   */
  async sendTemplatedEmail(emailData) {
    try {
      const { template, data, ...emailOptions } = emailData;

      // Render template
      const html = this.mailer.renderTemplate(template, data, 'html');
      const text = this.mailer.renderTemplate(template, data, 'text');

      return await this.sendEmail({
        ...emailOptions,
        html,
        text,
      });
    } catch (error) {
      logger.error('Templated email service error:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userData) {
    try {
      const { tenantId, to, name, ...options } = userData;

      return await this.sendTemplatedEmail({
        tenantId,
        to,
        subject: 'Welcome!',
        template: 'welcome',
        data: { name },
        ...options,
      });
    } catch (error) {
      logger.error('Welcome email service error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userData) {
    try {
      const { tenantId, to, resetToken, baseUrl, ...options } = userData;

      return await this.sendTemplatedEmail({
        tenantId,
        to,
        subject: 'Password Reset Request',
        template: 'password-reset',
        data: {
          resetToken,
          resetUrl: `${baseUrl}/reset-password?token=${resetToken}`,
        },
        ...options,
      });
    } catch (error) {
      logger.error('Password reset email service error:', error);
      throw error;
    }
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(notificationData) {
    try {
      const { tenantId, to, title, message, ...options } = notificationData;

      return await this.sendTemplatedEmail({
        tenantId,
        to,
        subject: title,
        template: 'notification',
        data: { title, message },
        ...options,
      });
    } catch (error) {
      logger.error('Notification email service error:', error);
      throw error;
    }
  }

  /**
   * Get email logs
   */
  async getEmailLogs(filters, pagination) {
    try {
      return await this.emailRepository.getEmailLogs(filters, pagination);
    } catch (error) {
      logger.error('Get email logs service error:', error);
      throw error;
    }
  }

  /**
   * Get email log by ID
   */
  async getEmailLogById(id) {
    try {
      return await this.emailRepository.getEmailLogById(id);
    } catch (error) {
      logger.error('Get email log by ID service error:', error);
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStatistics(tenantId, startDate, endDate) {
    try {
      return await this.emailRepository.getEmailStatistics(tenantId, startDate, endDate);
    } catch (error) {
      logger.error('Get email statistics service error:', error);
      throw error;
    }
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails(limit = 50) {
    try {
      const failedEmails = await this.emailRepository.getFailedEmailLogsForRetry(limit);
      const results = [];

      for (const emailLog of failedEmails) {
        try {
          // Reset status to pending
          await this.emailRepository.updateEmailLogStatus(emailLog.id, 'pending');

          // Retry sending
          const result = await this.emailConfig.sendEmail({
            to: emailLog.to,
            subject: emailLog.subject,
            body: emailLog.body,
            provider: emailLog.provider,
          });

          // Update status to sent
          await this.emailRepository.updateEmailLogStatus(
            emailLog.id,
            'sent',
            null
          );

          results.push({
            emailLogId: emailLog.id,
            success: true,
            messageId: result.messageId,
          });
        } catch (error) {
          // Update status to failed again
          await this.emailRepository.updateEmailLogStatus(
            emailLog.id,
            'failed',
            error.message
          );

          results.push({
            emailLogId: emailLog.id,
            success: false,
            error: error.message,
          });
        }
      }

      logger.info('Failed emails retry completed', {
        total: failedEmails.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      });

      return results;
    } catch (error) {
      logger.error('Retry failed emails service error:', error);
      throw error;
    }
  }

  /**
   * Clean up old email logs
   */
  async cleanupOldEmailLogs(daysOld = 90) {
    try {
      return await this.emailRepository.cleanupOldEmailLogs(daysOld);
    } catch (error) {
      logger.error('Cleanup old email logs service error:', error);
      throw error;
    }
  }

  /**
   * Get email logs by recipient
   */
  async getEmailLogsByRecipient(to, tenantId, limit = 50) {
    try {
      return await this.emailRepository.getEmailLogsByRecipient(to, tenantId, limit);
    } catch (error) {
      logger.error('Get email logs by recipient service error:', error);
      throw error;
    }
  }

  /**
   * Delete email log
   */
  async deleteEmailLog(id) {
    try {
      return await this.emailRepository.deleteEmailLog(id);
    } catch (error) {
      logger.error('Delete email log service error:', error);
      throw error;
    }
  }

  /**
   * Get supported email providers
   */
  getSupportedProviders() {
    return this.emailConfig.getSupportedProviders();
  }
}

// Create singleton instance
const emailService = new EmailService();

export { emailService };
export default emailService;
