import { cloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import config from '../config/index.js';
import logger from './logger.js';

/**
 * Uploads a local file to Cloudinary with fallback to local server static storage.
 *
 * @param {string} filePath - Absolute path to the local file
 * @param {object} [options={}] - Cloudinary upload options
 * @param {string} [options.folder='agency-cms'] - Cloudinary folder
 * @param {string} [options.resource_type='auto'] - Resource type
 * @returns {Promise<{ publicId: string, url: string, width: number, height: number, format: string, bytes: number, resourceType: string, isLocal: boolean }>}
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  const {
    folder = 'agency-cms',
    resource_type = 'auto',
    filename,
    ...rest
  } = options;

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type,
      ...rest,
    });

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width || 0,
      height: result.height || 0,
      format: result.format || '',
      bytes: result.bytes || 0,
      resourceType: result.resource_type || 'image',
      isLocal: false,
    };
  } catch (error) {
    logger.warn(`⚠️ Cloudinary upload error: ${error.message}. Falling back to local storage.`);

    const basename = filename || path.basename(filePath);
    const host = `http://localhost:${config.app.port}`;
    const localUrl = `${host}/uploads/${basename}`;

    return {
      publicId: `local/${basename}`,
      url: localUrl,
      width: 0,
      height: 0,
      format: path.extname(basename).replace('.', ''),
      bytes: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0,
      resourceType: 'image',
      isLocal: true,
    };
  }
};

/**
 * Deletes a resource from Cloudinary by public ID.
 *
 * @param {string} publicId - Cloudinary public_id
 * @param {string} [resourceType='image'] - Resource type
 * @returns {Promise<object>} Cloudinary destruction result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (publicId.startsWith('local/')) {
    const filename = publicId.replace('local/', '');
    const localPath = path.resolve(process.cwd(), 'src', 'uploads', filename);
    deleteLocalFile(localPath);
    return { result: 'deleted (local)' };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    logger.info(`☁️ Cloudinary resource deleted: ${publicId} (${result.result})`);
    return result;
  } catch (error) {
    logger.warn(`⚠️ Cloudinary deletion failed for ${publicId}: ${error.message}`);
    return { result: 'failed' };
  }
};

/**
 * Removes a temporary local file from disk after upload.
 *
 * @param {string} filePath - Absolute path to the file
 */
export const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`🗑️ Temp file removed: ${filePath}`);
    }
  } catch (error) {
    logger.warn(`⚠️ Failed to remove temp file ${filePath}: ${error.message}`);
  }
};
