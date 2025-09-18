import { dbConfig } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

class TenantRepository {
  constructor() {
    this.dbConfig = dbConfig;
  }

  get prisma() {
    return this.dbConfig.getClient();
  }

  async createTenant({ name, domain }) {
    try {
      return await this.prisma.tenant.create({ data: { name, domain } });
    } catch (error) {
      logger.error('Failed to create tenant:', error);
      throw error;
    }
  }

  async getTenantById(id) {
    try {
      return await this.prisma.tenant.findUnique({ where: { id } });
    } catch (error) {
      logger.error('Failed to get tenant by id:', error);
      throw error;
    }
  }

  async getTenantByDomain(domain) {
    try {
      return await this.prisma.tenant.findUnique({ where: { domain } });
    } catch (error) {
      logger.error('Failed to get tenant by domain:', error);
      throw error;
    }
  }
}

const tenantRepository = new TenantRepository();

export { tenantRepository };
export default tenantRepository;
