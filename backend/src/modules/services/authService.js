import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { tenantRepository } from '../repositories/tenantRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { dbConfig } from '../../config/db.js';
import { logger } from '../../utils/logger.js';

const signAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here', { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
const signRefreshToken = (payload) => jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key', { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

class AuthService {
  async registerTenantAndAdmin({ tenantName, domain, adminEmail, adminName }) {
    const prisma = dbConfig.getClient();
    return await prisma.$transaction(async (trx) => {
      const tenant = await trx.tenant.create({ data: { name: tenantName, domain } });
      const user = await trx.user.create({ data: { tenantId: tenant.id, email: adminEmail, name: adminName, role: 'admin' } });
      const accessToken = signAccessToken({ userId: user.id, tenantId: tenant.id, role: user.role, email: user.email });
      const refreshToken = signRefreshToken({ userId: user.id, type: 'refresh' });
      return { tenant, user, tokens: { accessToken, refreshToken } };
    });
  }

  async registerUser({ tenantId, email, name, role = 'user' }) {
    const user = await userRepository.createUser({ tenantId, email, name, role });
    const accessToken = signAccessToken({ userId: user.id, tenantId: user.tenantId, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, type: 'refresh' });
    return { user, tokens: { accessToken, refreshToken } };
  }

  async loginWithEmail({ email }) {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const accessToken = signAccessToken({ userId: user.id, tenantId: user.tenantId, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id, type: 'refresh' });
    return { user, tokens: { accessToken, refreshToken } };
  }

  async refresh({ refreshToken }) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
      if (decoded.type !== 'refresh') throw new Error('Invalid refresh token');
      const user = await userRepository.getUserById(decoded.userId);
      if (!user) throw new Error('User not found');
      const accessToken = signAccessToken({ userId: user.id, tenantId: user.tenantId, role: user.role, email: user.email });
      return { accessToken };
    } catch (err) {
      logger.error('Refresh token error:', err);
      throw new Error('Invalid refresh token');
    }
  }

  async me({ userId }) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }
}

const authService = new AuthService();

export { authService };
export default authService;
