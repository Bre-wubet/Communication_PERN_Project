import { PrismaClient } from '../../generated/prisma/index.js';
import { logger } from '../utils/logger.js';

class DatabaseConfig {
  constructor() {
    this.prisma = null;
  }

  async connect() {
    try {
      this.prisma = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'info', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ],
      });

      // Log queries in development
      if (process.env.NODE_ENV === 'development') {
        this.prisma.$on('query', (e) => {
          logger.debug('Query: ' + e.query);
          logger.debug('Params: ' + e.params);
          logger.debug('Duration: ' + e.duration + 'ms');
        });
      }

      await this.prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
      logger.info('Database disconnected');
    }
  }

  getClient() {
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.prisma;
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

// Create singleton instance
const dbConfig = new DatabaseConfig();

export { dbConfig };
export default dbConfig;
