import { dbConfig } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

class EmailRepository {
  constructor() {
    this.dbConfig = dbConfig;
  }

  get prisma() {
    return this.dbConfig.getClient();
  }

  /**
   * Create a new email log
   */
  async createEmailLog(emailData) {
    try {
      const emailLog = await this.prisma.emailLog.create({
        data: {
          tenantId: emailData.tenantId,
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          status: emailData.status || 'pending',
          provider: emailData.provider,
          errorMessage: emailData.errorMessage,
        },
      });

      logger.debug('Email log created:', { id: emailLog.id, to: emailLog.to });
      return emailLog;
    } catch (error) {
      logger.error('Failed to create email log:', error);
      throw error;
    }
  }

  /**
   * Get email log by ID
   */
  async getEmailLogById(id) {
    try {
      const emailLog = await this.prisma.emailLog.findUnique({
        where: { id },
        include: {
          tenant: true,
        },
      });

      return emailLog;
    } catch (error) {
      logger.error('Failed to get email log by ID:', error);
      throw error;
    }
  }

  /**
   * Get email logs with pagination and filters
   */
  async getEmailLogs(filters = {}, pagination = {}) {
    try {
      const {
        tenantId,
        status,
        to,
        startDate,
        endDate,
        provider,
      } = filters;

      const {
        page = 1,
        limit = 10,
      } = pagination;

      const skip = (page - 1) * limit;

      const where = {
        ...(tenantId && { tenantId }),
        ...(status && { status }),
        ...(to && { to: { contains: to, mode: 'insensitive' } }),
        ...(provider && { provider }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const [emailLogs, total] = await Promise.all([
        this.prisma.emailLog.findMany({
          where,
          include: {
            tenant: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.emailLog.count({ where }),
      ]);

      return {
        emailLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get email logs:', error);
      throw error;
    }
  }

  /**
   * Update email log status
   */
  async updateEmailLogStatus(id, status, errorMessage = null) {
    try {
      const emailLog = await this.prisma.emailLog.update({
        where: { id },
        data: {
          status,
          errorMessage,
          updatedAt: new Date(),
        },
      });

      logger.debug('Email log status updated:', { id, status });
      return emailLog;
    } catch (error) {
      logger.error('Failed to update email log status:', error);
      throw error;
    }
  }

  /**
   * Get email logs by status
   */
  async getEmailLogsByStatus(status, limit = 100) {
    try {
      const emailLogs = await this.prisma.emailLog.findMany({
        where: { status },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });

      return emailLogs;
    } catch (error) {
      logger.error('Failed to get email logs by status:', error);
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStatistics(tenantId, startDate, endDate) {
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
        sent,
        failed,
        pending,
      ] = await Promise.all([
        this.prisma.emailLog.count({ where }),
        this.prisma.emailLog.count({ where: { ...where, status: 'sent' } }),
        this.prisma.emailLog.count({ where: { ...where, status: 'failed' } }),
        this.prisma.emailLog.count({ where: { ...where, status: 'pending' } }),
      ]);

      return {
        total,
        sent,
        failed,
        pending,
        successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Failed to get email statistics:', error);
      throw error;
    }
  }

  /**
   * Get email logs by recipient
   */
  async getEmailLogsByRecipient(to, tenantId, limit = 50) {
    try {
      const emailLogs = await this.prisma.emailLog.findMany({
        where: {
          to: { contains: to, mode: 'insensitive' },
          tenantId,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          tenant: true,
        },
      });

      return emailLogs;
    } catch (error) {
      logger.error('Failed to get email logs by recipient:', error);
      throw error;
    }
  }

  /**
   * Delete email log
   */
  async deleteEmailLog(id) {
    try {
      await this.prisma.emailLog.delete({
        where: { id },
      });

      logger.debug('Email log deleted:', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete email log:', error);
      throw error;
    }
  }

  /**
   * Bulk update email log status
   */
  async bulkUpdateEmailLogStatus(ids, status, errorMessage = null) {
    try {
      const result = await this.prisma.emailLog.updateMany({
        where: { id: { in: ids } },
        data: {
          status,
          errorMessage,
          updatedAt: new Date(),
        },
      });

      logger.debug('Bulk email log status updated:', { count: result.count, status });
      return result;
    } catch (error) {
      logger.error('Failed to bulk update email log status:', error);
      throw error;
    }
  }

  /**
   * Get failed email logs for retry
   */
  async getFailedEmailLogsForRetry(limit = 50) {
    try {
      const emailLogs = await this.prisma.emailLog.findMany({
        where: {
          status: 'failed',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });

      return emailLogs;
    } catch (error) {
      logger.error('Failed to get failed email logs for retry:', error);
      throw error;
    }
  }

  /**
   * Clean up old email logs
   */
  async cleanupOldEmailLogs(daysOld = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await this.prisma.emailLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          status: {
            in: ['sent', 'failed'],
          },
        },
      });

      logger.info('Old email logs cleaned up:', { count: result.count, cutoffDate });
      return result;
    } catch (error) {
      logger.error('Failed to cleanup old email logs:', error);
      throw error;
    }
  }
}

// Create singleton instance
const emailRepository = new EmailRepository();

export { emailRepository };
export default emailRepository;
