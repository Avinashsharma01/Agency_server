import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

/**
 * Connects to MongoDB with retry logic and connection event handlers.
 * Uses recommended Mongoose 8 defaults for connection pooling.
 */
const connectDatabase = async () => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 5000;
  let retries = 0;

  const connect = async () => {
    try {
      const conn = await mongoose.connect(config.db.uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
      retries += 1;
      logger.error(`❌ MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${error.message}`);

      if (retries >= MAX_RETRIES) {
        logger.error('❌ MongoDB connection failed after maximum retries. Exiting.');
        process.exit(1);
      }

      logger.info(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connect();
    }
  };

  // Connection event handlers
  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('✅ MongoDB reconnected');
  });

  await connect();
};

/**
 * Gracefully closes the MongoDB connection.
 */
export const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('🔌 MongoDB connection closed gracefully');
  } catch (error) {
    logger.error(`❌ Error closing MongoDB connection: ${error.message}`);
  }
};

export default connectDatabase;
