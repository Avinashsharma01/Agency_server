import app from './app.js';
import config from './config/index.js';
import connectDatabase, { disconnectDatabase } from './config/database.js';
import configureCloudinary from './config/cloudinary.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import logger from './utils/logger.js';

/**
 * Bootstrap the server:
 * 1. Connect to MongoDB
 * 2. Configure external services (Cloudinary)
 * 3. Start HTTP server
 * 4. Register graceful shutdown handlers
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Configure Cloudinary
    configureCloudinary();

    // Connect to Redis (optional — fails gracefully)
    await connectRedis();

    // Start HTTP server
    const server = app.listen(config.app.port, () => {
      logger.info(`🚀 Server running in ${config.app.env} mode on port ${config.app.port}`);
      logger.info(`📖 Health check: http://localhost:${config.app.port}/health`);
    });

    // ─── Graceful Shutdown ──────────────────────────────────────────────
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('✅ HTTP server closed');

        // Close Redis connection
        await disconnectRedis();

        // Close database connection
        await disconnectDatabase();

        logger.info('👋 Process exiting gracefully');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('❌ Could not close connections in time. Forcefully shutting down.');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions that slip through
    process.on('uncaughtException', (error) => {
      logger.error(`❌ UNCAUGHT EXCEPTION: ${error.message}`, { stack: error.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error(`❌ UNHANDLED REJECTION: ${reason}`, { stack: reason?.stack });
      process.exit(1);
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
