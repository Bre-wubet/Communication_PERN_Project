import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define different log formats
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format: format,
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
  exitOnError: false,
});

// Create a stream object with a 'write' function for Morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Add request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  });
  
  next();
};

// Add error logging middleware
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

// Utility functions for structured logging
export const logEmail = (level, message, data = {}) => {
  logger[level](`[EMAIL] ${message}`, { ...data, module: 'email' });
};

export const logSms = (level, message, data = {}) => {
  logger[level](`[SMS] ${message}`, { ...data, module: 'sms' });
};

export const logPush = (level, message, data = {}) => {
  logger[level](`[PUSH] ${message}`, { ...data, module: 'push' });
};

export const logComment = (level, message, data = {}) => {
  logger[level](`[COMMENT] ${message}`, { ...data, module: 'comment' });
};

export const logDatabase = (level, message, data = {}) => {
  logger[level](`[DATABASE] ${message}`, { ...data, module: 'database' });
};

export const logAuth = (level, message, data = {}) => {
  logger[level](`[AUTH] ${message}`, { ...data, module: 'auth' });
};

// Performance logging
export const logPerformance = (operation, duration, data = {}) => {
  logger.info(`[PERFORMANCE] ${operation} completed in ${duration}ms`, {
    ...data,
    operation,
    duration,
    module: 'performance',
  });
};

// Security logging
export const logSecurity = (level, message, data = {}) => {
  logger[level](`[SECURITY] ${message}`, { ...data, module: 'security' });
};

export { logger };
export default logger;
