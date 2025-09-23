import Joi from 'joi';
import { handleValidationError } from './errorMiddleware.js';
import { logger } from '../utils/logger.js';

/**
 * Generic validation middleware factory
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
      });

      if (error) {
        const validationError = handleValidationError(error);
        return res.status(validationError.statusCode).json(validationError);
      }

      // Replace the request property with the validated and sanitized value
      // In Express 5, req.query is a read-only accessor. Avoid assigning directly.
      if (property === 'query') {
        // Attach validated query to a safe location and keep handlers using req.validatedQuery
        req.validatedQuery = value;
      } else {
        req[property] = value;
      }
      next();
    } catch (err) {
      logger.error('Validation middleware error:', err);
      return res.status(500).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      });
    }
  };
};

// Note: Validation schemas are now in separate files in modules/validations/

/**
 * Common validation schemas
 */
export const commonSchemas = {
  id: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  dateRange: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),

  search: Joi.object({
    search: Joi.string().min(1).max(100).optional(),
  }),
};

/**
 * Custom validation functions
 */
export const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  const { error } = schema.validate(email);
  return !error;
};

export const validatePhoneNumber = (phoneNumber) => {
  const schema = Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required();
  const { error } = schema.validate(phoneNumber);
  return !error;
};

export const validateObjectId = (id) => {
  const schema = Joi.number().integer().positive().required();
  const { error } = schema.validate(id);
  return !error;
};

/**
 * Sanitize input middleware
 */
export const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Do NOT assign to req.query in Express 5 (read-only accessor)
  // If needed later, attach a sanitized copy for explicit usage by handlers
  // req.sanitizedQuery = sanitizeObject(req.query);

  next();
};

export default {
  validate,
  commonSchemas,
  validateEmail,
  validatePhoneNumber,
  validateObjectId,
  sanitizeInput,
};
