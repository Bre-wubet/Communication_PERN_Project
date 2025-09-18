import { Router } from 'express';
import { smsController } from '../controllers/smsController.js';
import { validate } from '../../middlewares/validationMiddleware.js';
import { smsSchemas } from '../validations/smsValidation.js';
import { authenticateToken, authorize } from '../../middlewares/authMiddleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/sms/send
 * @desc    Send a single SMS
 * @access  Private
 */
router.post('/send',
  validate(smsSchemas.sendSms, 'body'),
  smsController.sendSms
);

/**
 * @route   POST /api/sms/send-bulk
 * @desc    Send bulk SMS
 * @access  Private
 */
router.post('/send-bulk',
  validate(smsSchemas.sendBulkSms, 'body'),
  smsController.sendBulkSms
);

/**
 * @route   POST /api/sms/send-notification
 * @desc    Send SMS notification
 * @access  Private
 */
router.post('/send-notification',
  validate(smsSchemas.sendSmsNotification, 'body'),
  smsController.sendSmsNotification
);

/**
 * @route   POST /api/sms/send-verification
 * @desc    Send verification SMS
 * @access  Private
 */
router.post('/send-verification',
  validate(smsSchemas.sendVerificationSms, 'body'),
  smsController.sendVerificationSms
);

/**
 * @route   POST /api/sms/send-alert
 * @desc    Send alert SMS
 * @access  Private
 */
router.post('/send-alert',
  validate(smsSchemas.sendAlertSms, 'body'),
  smsController.sendAlertSms
);

/**
 * @route   GET /api/sms/logs
 * @desc    Get SMS logs with pagination and filters
 * @access  Private
 */
router.get('/logs',
  validate(smsSchemas.getSmsLogs, 'query'),
  smsController.getSmsLogs
);

/**
 * @route   GET /api/sms/logs/:id
 * @desc    Get SMS log by ID
 * @access  Private
 */
router.get('/logs/:id',
  validate(smsSchemas.getSmsLogById, 'params'),
  smsController.getSmsLogById
);

/**
 * @route   GET /api/sms/statistics
 * @desc    Get SMS statistics
 * @access  Private
 */
router.get('/statistics',
  validate(smsSchemas.getSmsStatistics, 'query'),
  smsController.getSmsStatistics
);

/**
 * @route   POST /api/sms/retry-failed
 * @desc    Retry failed SMS
 * @access  Private (Admin only)
 */
router.post('/retry-failed',
  authorize('admin'),
  validate(smsSchemas.retryFailedSms, 'query'),
  smsController.retryFailedSms
);

/**
 * @route   DELETE /api/sms/cleanup
 * @desc    Clean up old SMS logs
 * @access  Private (Admin only)
 */
router.delete('/cleanup',
  authorize('admin'),
  validate(smsSchemas.cleanupOldSmsLogs, 'query'),
  smsController.cleanupOldSmsLogs
);

/**
 * @route   GET /api/sms/logs/phone/:phone
 * @desc    Get SMS logs by phone number
 * @access  Private
 */
router.get('/logs/phone/:phone',
  validate(smsSchemas.getSmsLogsByPhone, 'params'),
  validate(smsSchemas.getSmsLogsByPhone, 'query'),
  smsController.getSmsLogsByPhone
);

/**
 * @route   GET /api/sms/logs/provider/:provider
 * @desc    Get SMS logs by provider
 * @access  Private
 */
router.get('/logs/provider/:provider',
  validate(smsSchemas.getSmsLogsByProvider, 'params'),
  validate(smsSchemas.getSmsLogsByProvider, 'query'),
  smsController.getSmsLogsByProvider
);

/**
 * @route   GET /api/sms/logs/count-by-status
 * @desc    Get SMS logs count by status
 * @access  Private
 */
router.get('/logs/count-by-status',
  validate(smsSchemas.getSmsLogsCountByStatus, 'query'),
  smsController.getSmsLogsCountByStatus
);

/**
 * @route   DELETE /api/sms/logs/:id
 * @desc    Delete SMS log
 * @access  Private (Admin only)
 */
router.delete('/logs/:id',
  authorize('admin'),
  validate(smsSchemas.deleteSmsLog, 'params'),
  smsController.deleteSmsLog
);

/**
 * @route   GET /api/sms/providers
 * @desc    Get supported SMS providers
 * @access  Private
 */
router.get('/providers',
  smsController.getSupportedProviders
);

export default router;
