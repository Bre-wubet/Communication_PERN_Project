import { emailService } from '../services/emailService.js';
import { logger } from '../../utils/logger.js';
import { asyncHandler } from '../../middlewares/errorMiddleware.js';

class EmailController {
  constructor() {
    this.emailService = emailService;
  }

  /**
   * Send a single email
   */
  sendEmail = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const emailData = {
        ...req.body,
        tenantId,
      };

      const result = await this.emailService.sendEmail(emailData);

      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send email controller error:', error);
      throw error;
    }
  });

  /**
   * Send bulk emails
   */
  sendBulkEmails = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const emailData = {
        ...req.body,
        tenantId,
      };

      const result = await this.emailService.sendBulkEmails(emailData);

      res.status(200).json({
        success: true,
        message: 'Bulk emails sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send bulk emails controller error:', error);
      throw error;
    }
  });

  /**
   * Send templated email
   */
  sendTemplatedEmail = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const emailData = {
        ...req.body,
        tenantId,
      };

      const result = await this.emailService.sendTemplatedEmail(emailData);

      res.status(200).json({
        success: true,
        message: 'Templated email sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send templated email controller error:', error);
      throw error;
    }
  });

  /**
   * Send welcome email
   */
  sendWelcomeEmail = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const userData = {
        ...req.body,
        tenantId,
      };

      const result = await this.emailService.sendWelcomeEmail(userData);

      res.status(200).json({
        success: true,
        message: 'Welcome email sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send welcome email controller error:', error);
      throw error;
    }
  });

  /**
   * Send password reset email
   */
  sendPasswordResetEmail = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const userData = {
        ...req.body,
        tenantId,
      };

      const result = await this.emailService.sendPasswordResetEmail(userData);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send password reset email controller error:', error);
      throw error;
    }
  });

  /**
   * Send notification email
   */
  sendNotificationEmail = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const notificationData = {
        ...req.body,
        tenantId,
      };

      const result = await this.emailService.sendNotificationEmail(notificationData);

      res.status(200).json({
        success: true,
        message: 'Notification email sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send notification email controller error:', error);
      throw error;
    }
  });

  /**
   * Get email logs
   */
  getEmailLogs = asyncHandler(async (req, res) => {
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

      const result = await this.emailService.getEmailLogs(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Email logs retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get email logs controller error:', error);
      throw error;
    }
  });

  /**
   * Get email log by ID
   */
  getEmailLogById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.emailService.getEmailLogById(parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Email log not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Email log retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get email log by ID controller error:', error);
      throw error;
    }
  });

  /**
   * Get email statistics
   */
  getEmailStatistics = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { startDate, endDate } = req.query;

      const result = await this.emailService.getEmailStatistics(
        tenantId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        message: 'Email statistics retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get email statistics controller error:', error);
      throw error;
    }
  });

  /**
   * Retry failed emails
   */
  retryFailedEmails = asyncHandler(async (req, res) => {
    try {
      const { limit } = req.query;
      const result = await this.emailService.retryFailedEmails(parseInt(limit) || 50);

      res.status(200).json({
        success: true,
        message: 'Failed emails retry completed',
        data: result,
      });
    } catch (error) {
      logger.error('Retry failed emails controller error:', error);
      throw error;
    }
  });

  /**
   * Clean up old email logs
   */
  cleanupOldEmailLogs = asyncHandler(async (req, res) => {
    try {
      const { daysOld } = req.query;
      const result = await this.emailService.cleanupOldEmailLogs(parseInt(daysOld) || 90);

      res.status(200).json({
        success: true,
        message: 'Old email logs cleaned up successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Cleanup old email logs controller error:', error);
      throw error;
    }
  });

  /**
   * Get email logs by recipient
   */
  getEmailLogsByRecipient = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { to } = req.params;
      const { limit } = req.query;

      const result = await this.emailService.getEmailLogsByRecipient(
        to,
        tenantId,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        message: 'Email logs by recipient retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get email logs by recipient controller error:', error);
      throw error;
    }
  });

  /**
   * Delete email log
   */
  deleteEmailLog = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.emailService.deleteEmailLog(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Email log deleted successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Delete email log controller error:', error);
      throw error;
    }
  });

  /**
   * Get supported email providers
   */
  getSupportedProviders = asyncHandler(async (req, res) => {
    try {
      const providers = this.emailService.getSupportedProviders();

      res.status(200).json({
        success: true,
        message: 'Supported email providers retrieved successfully',
        data: { providers },
      });
    } catch (error) {
      logger.error('Get supported email providers controller error:', error);
      throw error;
    }
  });
}

// Create singleton instance
const emailController = new EmailController();

export { emailController };
export default emailController;
