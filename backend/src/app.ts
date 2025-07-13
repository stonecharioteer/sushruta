import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from '@/config/database';
import { config } from '@/config';
import { logger } from '@/config/logger';
import { requestLogger } from '@/middleware/requestLogger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { apiRoutes } from '@/routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Routes
app.use('/', apiRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Database initialization and server startup
const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    logger.info('Database connection established successfully');

    // Start server
    const server = app.listen(config.server.port, () => {
      logger.info(`Server is running on port ${config.server.port}`);
      logger.info(`Environment: ${config.node.env}`);
      logger.info(`Database: ${config.database.type}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await AppDataSource.destroy();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during database disconnection:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server only if this file is executed directly
if (require.main === module) {
  startServer();
}

export { app, startServer };