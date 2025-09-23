import { dbConfig } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

class SmsRepository {
  constructor() {
    this.dbConfig = dbConfig;
  }

  get prisma() {
    return this.dbConfig.getClient();
  }

  /**
   * Create a new SMS log
   */
  async createSmsLog(smsData) {
    try {
      const smsLog = await this.prisma.smsLog.create({
        data: {
          tenantId: smsData.tenantId,
          phone: smsData.phone,
          message: smsData.message,
          status: smsData.status || 'pending',
          provider: smsData.provider,
          errorMessage: smsData.errorMessage,
        },
      });

      logger.debug('SMS log created:', { id: smsLog.id, phone: smsLog.phone });
      return smsLog;
    } catch (error) {
      logger.error('Failed to create SMS log:', error);
      throw error;
    }
  }

  /**
   * Get SMS log by ID
   */
  async getSmsLogById(id) {
    try {
      const smsLog = await this.prisma.smsLog.findUnique({
        where: { id },
        include: {
          tenant: true,
        },
      });

      return smsLog;
    } catch (error) {
      logger.error('Failed to get SMS log by ID:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs with pagination and filters
   */
  async getSmsLogs(filters = {}, pagination = {}) {
    try {
      const {
        tenantId,
        status,
        phone,
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
        ...(phone && { phone: { contains: phone, mode: 'insensitive' } }),
        ...(provider && { provider }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      };

      const [smsLogs, total] = await Promise.all([
        this.prisma.smsLog.findMany({
          where,
          include: {
            tenant: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.smsLog.count({ where }),
      ]);

      return {
        smsLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get SMS logs:', error);
      throw error;
    }
  }

  /**
   * Update SMS log status
   */
  async updateSmsLogStatus(id, status, errorMessage = null) {
    try {
      const smsLog = await this.prisma.smsLog.update({
        where: { id },
        data: {
          status,
          errorMessage,
          updatedAt: new Date(),
        },
      });

      logger.debug('SMS log status updated:', { id, status });
      return smsLog;
    } catch (error) {
      logger.error('Failed to update SMS log status:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs by status
   */
  async getSmsLogsByStatus(status, limit = 100) {
    try {
      const smsLogs = await this.prisma.smsLog.findMany({
        where: { status },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });

      return smsLogs;
    } catch (error) {
      logger.error('Failed to get SMS logs by status:', error);
      throw error;
    }
  }

  /**
   * Get SMS statistics
   */
  async getSmsStatistics(tenantId, startDate, endDate) {
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
        this.prisma.smsLog.count({ where }),
        this.prisma.smsLog.count({ where: { ...where, status: 'sent' } }),
        this.prisma.smsLog.count({ where: { ...where, status: 'failed' } }),
        this.prisma.smsLog.count({ where: { ...where, status: 'pending' } }),
      ]);

      return {
        total,
        sent,
        failed,
        pending,
        successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Failed to get SMS statistics:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs by phone number
   */
  async getSmsLogsByPhone(phone, tenantId, limit = 50) {
    try {
      const smsLogs = await this.prisma.smsLog.findMany({
        where: {
          phone: { contains: phone, mode: 'insensitive' },
          tenantId,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          tenant: true,
        },
      });

      return smsLogs;
    } catch (error) {
      logger.error('Failed to get SMS logs by phone:', error);
      throw error;
    }
  }

  /**
   * Delete SMS log
   */
  async deleteSmsLog(id) {
    try {
      await this.prisma.smsLog.delete({
        where: { id },
      });

      logger.debug('SMS log deleted:', { id });
      return true;
    } catch (error) {
      logger.error('Failed to delete SMS log:', error);
      throw error;
    }
  }

  /**
   * Bulk update SMS log status
   */
  async bulkUpdateSmsLogStatus(ids, status, errorMessage = null) {
    try {
      const result = await this.prisma.smsLog.updateMany({
        where: { id: { in: ids } },
        data: {
          status,
          errorMessage,
          updatedAt: new Date(),
        },
      });

      logger.debug('Bulk SMS log status updated:', { count: result.count, status });
      return result;
    } catch (error) {
      logger.error('Failed to bulk update SMS log status:', error);
      throw error;
    }
  }

  /**
   * Get failed SMS logs for retry
   */
  async getFailedSmsLogsForRetry(limit = 50) {
    try {
      const smsLogs = await this.prisma.smsLog.findMany({
        where: {
          status: 'failed',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });

      return smsLogs;
    } catch (error) {
      logger.error('Failed to get failed SMS logs for retry:', error);
      throw error;
    }
  }

  /**
   * Clean up old SMS logs
   */
  async cleanupOldSmsLogs(daysOld = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await this.prisma.smsLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          status: {
            in: ['sent', 'failed'],
          },
        },
      });

      logger.info('Old SMS logs cleaned up:', { count: result.count, cutoffDate });
      return result;
    } catch (error) {
      logger.error('Failed to cleanup old SMS logs:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs by provider
   */
  async getSmsLogsByProvider(provider, tenantId, limit = 100) {
    try {
      const smsLogs = await this.prisma.smsLog.findMany({
        where: {
          provider,
          tenantId,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          tenant: true,
        },
      });

      return smsLogs;
    } catch (error) {
      logger.error('Failed to get SMS logs by provider:', error);
      throw error;
    }
  }

  /**
   * Get SMS logs count by status for a tenant
   */
  async getSmsLogsCountByStatus(tenantId) {
    try {
      const counts = await this.prisma.smsLog.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true },
      });

      const result = {};
      counts.forEach(count => {
        result[count.status] = count._count.status;
      });

      return result;
    } catch (error) {
      logger.error('Failed to get SMS logs count by status:', error);
      throw error;
    }
  }
}

// Create singleton instance
const smsRepository = new SmsRepository();

export { smsRepository };
export default smsRepository;
