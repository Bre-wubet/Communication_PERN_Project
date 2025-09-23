import { Router } from 'express';
import { emailController } from '../controllers/emailController.js';
import { validate } from '../../middlewares/validationMiddleware.js';
import { emailSchemas } from '../validations/emailValidation.js';
import { authenticateToken, authorize } from '../../middlewares/authMiddleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/emails/send
 * @desc    Send a single email
 * @access  Private
 */
router.post('/send', 
  validate(emailSchemas.sendEmail, 'body'),
  emailController.sendEmail
);

/**
 * @route   POST /api/emails/send-bulk
 * @desc    Send bulk emails
 * @access  Private
 */
router.post('/send-bulk',
  validate(emailSchemas.sendBulkEmail, 'body'),
  emailController.sendBulkEmails
);

/**
 * @route   POST /api/emails/send-templated
 * @desc    Send templated email
 * @access  Private
 */
router.post('/send-templated',
  validate(emailSchemas.sendTemplatedEmail, 'body'),
  emailController.sendTemplatedEmail
);

/**
 * @route   POST /api/emails/send-welcome
 * @desc    Send welcome email
 * @access  Private
 */
router.post('/send-welcome',
  validate(emailSchemas.sendWelcomeEmail, 'body'),
  emailController.sendWelcomeEmail
);

/**
 * @route   POST /api/emails/send-password-reset
 * @desc    Send password reset email
 * @access  Private
 */
router.post('/send-password-reset',
  validate(emailSchemas.sendPasswordResetEmail, 'body'),
  emailController.sendPasswordResetEmail
);

/**
 * @route   POST /api/emails/send-notification
 * @desc    Send notification email
 * @access  Private
 */
router.post('/send-notification',
  validate(emailSchemas.sendNotificationEmail, 'body'),
  emailController.sendNotificationEmail
);

/**
 * @route   GET /api/emails/logs
 * @desc    Get email logs with pagination and filters
 * @access  Private
 */
router.get('/logs',
  validate(emailSchemas.getEmailLogs, 'query'),
  emailController.getEmailLogs
);

/**
 * @route   GET /api/emails/logs/:id
 * @desc    Get email log by ID
 * @access  Private
 */
router.get('/logs/:id',
  validate(emailSchemas.getEmailLogById, 'params'),
  emailController.getEmailLogById
);

/**
 * @route   GET /api/emails/statistics
 * @desc    Get email statistics
 * @access  Private
 */
router.get('/statistics',
  validate(emailSchemas.getEmailStatistics, 'query'),
  emailController.getEmailStatistics
);

/**
 * @route   POST /api/emails/retry-failed
 * @desc    Retry failed emails
 * @access  Private (Admin only)
 */
router.post('/retry-failed',
  authorize('admin'),
  validate(emailSchemas.retryFailedEmails, 'query'),
  emailController.retryFailedEmails
);

/**
 * @route   DELETE /api/emails/cleanup
 * @desc    Clean up old email logs
 * @access  Private (Admin only)
 */
router.delete('/cleanup',
  authorize('admin'),
  validate(emailSchemas.cleanupOldEmailLogs, 'query'),
  emailController.cleanupOldEmailLogs
);

/**
 * @route   GET /api/emails/logs/recipient/:to
 * @desc    Get email logs by recipient
 * @access  Private
 */
router.get('/logs/recipient/:to',
  validate(emailSchemas.getEmailLogsByRecipient, 'params'),
  validate(emailSchemas.getEmailLogsByRecipient, 'query'),
  emailController.getEmailLogsByRecipient
);

/**
 * @route   DELETE /api/emails/logs/:id
 * @desc    Delete email log
 * @access  Private (Admin only)
 */
router.delete('/logs/:id',
  authorize('admin'),
  validate(emailSchemas.deleteEmailLog, 'params'),
  emailController.deleteEmailLog
);

/**
 * @route   GET /api/emails/providers
 * @desc    Get supported email providers
 * @access  Private
 */
router.get('/providers',
  emailController.getSupportedProviders
);

export default router;
