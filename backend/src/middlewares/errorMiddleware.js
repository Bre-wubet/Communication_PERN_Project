import { logger } from '../utils/logger.js';

// Request logging middleware is imported from logger.js

/**
 * Error logging middleware
 */
export const errorLogger = (err, req, res, next) => {
  logger.error(`${err.message}`, {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  
  next(err);
};

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Prisma errors
  if (err.code === 'P2002') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = { message, statusCode: 404 };
  }

  if (err.code === 'P2003') {
    const message = 'Foreign key constraint failed';
    error = { message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    const message = 'Too many requests';
    error = { message, statusCode: 429 };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler for undefined routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error handler
 */
export const handleValidationError = (error) => {
  const errors = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));

  return {
    success: false,
    message: 'Validation failed',
    errors,
    statusCode: 400,
  };
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error) => {
  logger.error('Database error:', error);

  if (error.code === 'P2002') {
    return {
      success: false,
      message: 'Duplicate field value entered',
      statusCode: 400,
    };
  }

  if (error.code === 'P2025') {
    return {
      success: false,
      message: 'Record not found',
      statusCode: 404,
    };
  }

  if (error.code === 'P2003') {
    return {
      success: false,
      message: 'Foreign key constraint failed',
      statusCode: 400,
    };
  }

  return {
    success: false,
    message: 'Database operation failed',
    statusCode: 500,
  };
};

/**
 * External service error handler
 */
export const handleExternalServiceError = (error, service) => {
  logger.error(`${service} service error:`, error);

  if (error.response) {
    // The request was made and the server responded with a status code
    return {
      success: false,
      message: `${service} service error: ${error.response.status}`,
      statusCode: error.response.status,
    };
  }

  if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: `${service} service is unavailable`,
      statusCode: 503,
    };
  }

  // Something else happened
  return {
    success: false,
    message: `${service} service error`,
    statusCode: 500,
  };
};

/**
 * Rate limiting error handler
 */
export const handleRateLimitError = (req, res) => {
  return res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  });
};

/**
 * CORS error handler
 */
export const handleCorsError = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      code: 'CORS_ERROR',
    });
  }
  next(err);
};

/**
 * Timeout error handler
 */
export const handleTimeoutError = (req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'Request timeout',
        code: 'TIMEOUT',
      });
    }
  }, 30000); // 30 seconds timeout

  res.on('finish', () => clearTimeout(timeout));
  next();
};

export default {
  errorLogger,
  errorHandler,
  notFound,
  asyncHandler,
  AppError,
  handleValidationError,
  handleDatabaseError,
  handleExternalServiceError,
  handleRateLimitError,
  handleCorsError,
  handleTimeoutError,
};
