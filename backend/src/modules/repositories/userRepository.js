import { dbConfig } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

class UserRepository {
  constructor() {
    this.dbConfig = dbConfig;
  }

  get prisma() {
    return this.dbConfig.getClient();
  }

  async createUser({ tenantId, email, name, role = 'user', passwordHash = null }) {
    try {
      return await this.prisma.user.create({
        data: { tenantId, email, name, role },
      });
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      logger.error('Failed to get user by email:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error) {
      logger.error('Failed to get user by id:', error);
      throw error;
    }
  }

  async listUsersByTenant(tenantId, pagination = { page: 1, limit: 20 }) {
    try {
      const skip = (pagination.page - 1) * pagination.limit;
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({ where: { tenantId }, skip, take: pagination.limit, orderBy: { createdAt: 'desc' } }),
        this.prisma.user.count({ where: { tenantId } }),
      ]);
      return { users, pagination: { ...pagination, total, pages: Math.ceil(total / pagination.limit) } };
    } catch (error) {
      logger.error('Failed to list users by tenant:', error);
      throw error;
    }
  }
}

const userRepository = new UserRepository();

export { userRepository };
export default userRepository;
