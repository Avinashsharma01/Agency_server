import { v2 as cloudinary } from 'cloudinary';
import config from './index.js';
import logger from '../utils/logger.js';

/**
 * Configures the Cloudinary SDK with credentials from environment.
 * Must be called once during application bootstrap.
 */
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });

  logger.info('☁️  Cloudinary configured');
};

export { cloudinary };
export default configureCloudinary;
