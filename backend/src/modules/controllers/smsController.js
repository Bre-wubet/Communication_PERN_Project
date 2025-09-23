import { smsService } from '../services/smsService.js';
import { logger } from '../../utils/logger.js';
import { asyncHandler } from '../../middlewares/errorMiddleware.js';

class SmsController {
  constructor() {
    this.smsService = smsService;
  }

  /**
   * Send a single SMS
   */
  sendSms = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const smsData = {
        ...req.body,
        tenantId,
      };

      const result = await this.smsService.sendSms(smsData);

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send SMS controller error:', error);
      throw error;
    }
  });

  /**
   * Send bulk SMS
   */
  sendBulkSms = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const smsData = {
        ...req.body,
        tenantId,
      };

      const result = await this.smsService.sendBulkSms(smsData);

      res.status(200).json({
        success: true,
        message: 'Bulk SMS sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send bulk SMS controller error:', error);
      throw error;
    }
  });

  /**
   * Send SMS notification
   */
  sendSmsNotification = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const notificationData = {
        ...req.body,
        tenantId,
      };

      const result = await this.smsService.sendSmsNotification(notificationData);

      res.status(200).json({
        success: true,
        message: 'SMS notification sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send SMS notification controller error:', error);
      throw error;
    }
  });

  /**
   * Send verification SMS
   */
  sendVerificationSms = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const userData = {
        ...req.body,
        tenantId,
      };

      const result = await this.smsService.sendVerificationSms(userData);

      res.status(200).json({
        success: true,
        message: 'Verification SMS sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send verification SMS controller error:', error);
      throw error;
    }
  });

  /**
   * Send alert SMS
   */
  sendAlertSms = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const alertData = {
        ...req.body,
        tenantId,
      };

      const result = await this.smsService.sendAlertSms(alertData);

      res.status(200).json({
        success: true,
        message: 'Alert SMS sent successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Send alert SMS controller error:', error);
      throw error;
    }
  });

  /**
   * Get SMS logs
   */
  getSmsLogs = asyncHandler(async (req, res) => {
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

      const result = await this.smsService.getSmsLogs(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'SMS logs retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get SMS logs controller error:', error);
      throw error;
    }
  });

  /**
   * Get SMS log by ID
   */
  getSmsLogById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.smsService.getSmsLogById(parseInt(id));

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'SMS log not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'SMS log retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get SMS log by ID controller error:', error);
      throw error;
    }
  });

  /**
   * Get SMS statistics
   */
  getSmsStatistics = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { startDate, endDate } = req.query;

      const result = await this.smsService.getSmsStatistics(
        tenantId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        message: 'SMS statistics retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get SMS statistics controller error:', error);
      throw error;
    }
  });

  /**
   * Retry failed SMS
   */
  retryFailedSms = asyncHandler(async (req, res) => {
    try {
      const { limit } = req.query;
      const result = await this.smsService.retryFailedSms(parseInt(limit) || 50);

      res.status(200).json({
        success: true,
        message: 'Failed SMS retry completed',
        data: result,
      });
    } catch (error) {
      logger.error('Retry failed SMS controller error:', error);
      throw error;
    }
  });

  /**
   * Clean up old SMS logs
   */
  cleanupOldSmsLogs = asyncHandler(async (req, res) => {
    try {
      const { daysOld } = req.query;
      const result = await this.smsService.cleanupOldSmsLogs(parseInt(daysOld) || 90);

      res.status(200).json({
        success: true,
        message: 'Old SMS logs cleaned up successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Cleanup old SMS logs controller error:', error);
      throw error;
    }
  });

  /**
   * Get SMS logs by phone number
   */
  getSmsLogsByPhone = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { phone } = req.params;
      const { limit } = req.query;

      const result = await this.smsService.getSmsLogsByPhone(
        phone,
        tenantId,
        parseInt(limit) || 50
      );

      res.status(200).json({
        success: true,
        message: 'SMS logs by phone retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get SMS logs by phone controller error:', error);
      throw error;
    }
  });

  /**
   * Get SMS logs by provider
   */
  getSmsLogsByProvider = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const { provider } = req.params;
      const { limit } = req.query;

      const result = await this.smsService.getSmsLogsByProvider(
        provider,
        tenantId,
        parseInt(limit) || 100
      );

      res.status(200).json({
        success: true,
        message: 'SMS logs by provider retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get SMS logs by provider controller error:', error);
      throw error;
    }
  });

  /**
   * Get SMS logs count by status
   */
  getSmsLogsCountByStatus = asyncHandler(async (req, res) => {
    try {
      const tenantId = req.user?.tenantId || req.tenant?.id;
      const result = await this.smsService.getSmsLogsCountByStatus(tenantId);

      res.status(200).json({
        success: true,
        message: 'SMS logs count by status retrieved successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Get SMS logs count by status controller error:', error);
      throw error;
    }
  });

  /**
   * Delete SMS log
   */
  deleteSmsLog = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.smsService.deleteSmsLog(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'SMS log deleted successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Delete SMS log controller error:', error);
      throw error;
    }
  });

  /**
   * Get supported SMS providers
   */
  getSupportedProviders = asyncHandler(async (req, res) => {
    try {
      const providers = this.smsService.getSupportedProviders();

      res.status(200).json({
        success: true,
        message: 'Supported SMS providers retrieved successfully',
        data: { providers },
      });
    } catch (error) {
      logger.error('Get supported SMS providers controller error:', error);
      throw error;
    }
  });
}

// Create singleton instance
const smsController = new SmsController();

export { smsController };
export default smsController;
