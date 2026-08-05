import nodemailer from 'nodemailer';
import config from './index.js';
import logger from '../utils/logger.js';

/**
 * Creates and verifies an SMTP transporter.
 * Falls back gracefully if SMTP verification fails in development.
 */
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10,
  });

  // Verify connection in development
  if (config.app.isDevelopment) {
    transporter.verify((error) => {
      if (error) {
        logger.warn(`⚠️  SMTP verification failed: ${error.message}`);
      } else {
        logger.info('📧 SMTP transporter ready');
      }
    });
  }

  return transporter;
};

const transporter = createTransporter();

export default transporter;
