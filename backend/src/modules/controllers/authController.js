import { authService } from '../services/authService.js';
import { asyncHandler } from '../../middlewares/errorMiddleware.js';
import { generateToken, generateRefreshToken, authenticateToken } from '../../middlewares/authMiddleware.js';

class AuthController {
  registerTenantAndAdmin = asyncHandler(async (req, res) => {
    const { tenantName, domain, adminEmail, adminName } = req.body;
    const result = await authService.registerTenantAndAdmin({ tenantName, domain, adminEmail, adminName });
    return res.status(201).json({ success: true, message: 'Tenant and admin created', data: result });
  });

  registerUser = asyncHandler(async (req, res) => {
    const tenantId = req.tenant?.id || req.user?.tenantId || req.body.tenantId;
    const { email, name, role } = req.body;
    const result = await authService.registerUser({ tenantId, email, name, role });
    return res.status(201).json({ success: true, message: 'User created', data: result });
  });

  loginWithEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.loginWithEmail({ email });
    return res.status(200).json({ success: true, message: 'Login successful', data: result });
  });

  refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await authService.refresh({ refreshToken });
    return res.status(200).json({ success: true, message: 'Token refreshed', data: result });
  });

  me = asyncHandler(async (req, res) => {
    const user = await authService.me({ userId: req.user.userId || req.user.id });
    return res.status(200).json({ success: true, data: user });
  });
}

const authController = new AuthController();

export { authController };
export default authController;
