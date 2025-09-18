import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';

// Import middlewares
import { errorHandler, notFound, errorLogger } from './middlewares/errorMiddleware.js';
import { requestLogger } from './utils/logger.js';
import { sanitizeInput } from './middlewares/validationMiddleware.js';

// Import routes
import emailRoutes from './modules/routes/emailRoutes.js';
import smsRoutes from './modules/routes/smsRoutes.js';
import pushRoutes from './modules/routes/pushRoutes.js';
import commentRoutes from './modules/routes/commentRoutes.js';
import authRoutes from './modules/routes/authRoutes.js';

// Import database configuration
import { dbConfig } from './config/db.js';

// Import logger
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddlewares() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(morgan('combined', { stream: { write: message => logger.http(message.trim()) } }));

    // Custom request logger
    this.app.use(requestLogger);

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Input sanitization
    this.app.use(sanitizeInput);

    // Trust proxy (for rate limiting behind reverse proxy)
    this.app.set('trust proxy', 1);
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const dbHealth = await dbConfig.healthCheck();
        
        res.status(200).json({
          success: true,
          message: 'Service is healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          database: dbHealth,
        });
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
          success: false,
          message: 'Service is unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message,
        });
      }
    });

    // API documentation endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'Communication API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          email: '/api/emails',
          sms: '/api/sms',
          push: '/api/push',
          comments: '/api/comments',
          auth: '/api/auth',
        },
        documentation: 'https://github.com/your-org/communication-api',
      });
    });

    // API routes
    this.app.use('/api/emails', emailRoutes);
    this.app.use('/api/sms', smsRoutes);
    this.app.use('/api/push', pushRoutes);
    this.app.use('/api/comments', commentRoutes);
    this.app.use('/api/auth', authRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Welcome to Communication API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });
  }

  setupErrorHandling() {
    // Error logging middleware
    this.app.use(errorLogger);

    // 404 handler
    this.app.use(notFound);

    // Global error handler
    this.app.use(errorHandler);
  }

  async start() {
    try {
      // Try to connect to database
      try {
        await dbConfig.connect();
      } catch (dbError) {
        logger.warn('Database connection failed, starting server without database:', dbError.message);
        logger.warn('Some features may not work properly without a database connection');
      }

      // Start server
      this.app.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
        logger.info(`API documentation: http://localhost:${this.port}/api`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown.bind(this));
      process.on('SIGINT', this.gracefulShutdown.bind(this));
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    try {
      // Close database connection
      await dbConfig.disconnect();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and export app instance
const app = new App();

export default app;
