import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../../middlewares/validationMiddleware.js';
import { authSchemas } from '../validations/authValidation.js';
import { authenticateToken } from '../../middlewares/authMiddleware.js';

const router = Router();

router.post('/register-tenant', validate(authSchemas.registerTenantAndAdmin, 'body'), authController.registerTenantAndAdmin);
router.post('/register-user', authenticateToken, validate(authSchemas.registerUser, 'body'), authController.registerUser);
router.post('/login', validate(authSchemas.loginWithEmail, 'body'), authController.loginWithEmail);
router.post('/refresh', validate(authSchemas.refresh, 'body'), authController.refresh);
router.get('/me', authenticateToken, authController.me);

export default router;
