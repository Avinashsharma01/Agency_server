import { cloudinary } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { MESSAGES } from '../constants/index.js';
import config from '../config/index.js';
import fs from 'fs';
import path from 'path';

/**
 * Uploads a file to Cloudinary.
 *
 * @param {string} filePath - Local file path to upload
 * @param {string} folder - Cloudinary folder name
 * @param {object} [options={}] - Additional Cloudinary upload options
 * @returns {Promise<object>} Cloudinary upload result { publicId, url, secureUrl, format, width, height, bytes, resourceType }
 */
export const uploadToCloudinary = async (filePath, folder, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
      originalFilename: result.original_filename,
    };
  } catch (error) {
    logger.error(`Cloudinary upload failed: ${error.message}`, {
      stack: error.stack,
      httpCode: error.http_code,
      name: error.name,
    });
    throw ApiError.internal(`${MESSAGES.MEDIA.UPLOAD_FAILED}: ${error.message}`);
  }
};

/**
 * Uploads multiple files to Cloudinary.
 *
 * @param {string[]} filePaths - Array of local file paths
 * @param {string} folder - Cloudinary folder name
 * @param {object} [options={}] - Additional Cloudinary upload options
 * @returns {Promise<object[]>} Array of Cloudinary upload results
 */
export const uploadMultipleToCloudinary = async (filePaths, folder, options = {}) => {
  const uploadPromises = filePaths.map((filePath) =>
    uploadToCloudinary(filePath, folder, options)
  );
  return Promise.all(uploadPromises);
};

/**
 * Deletes a file from Cloudinary by public ID.
 *
 * @param {string} publicId - Cloudinary public ID
 * @param {string} [resourceType='image'] - Resource type ('image', 'video', 'raw')
 * @returns {Promise<object>} Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      logger.warn(`Cloudinary deletion returned unexpected result: ${result.result} for ${publicId}`);
    }

    return result;
  } catch (error) {
    logger.error(`Cloudinary deletion failed for ${publicId}: ${error.message}`);
    throw ApiError.internal('Failed to delete media from Cloudinary');
  }
};

/**
 * Deletes multiple files from Cloudinary.
 *
 * @param {string[]} publicIds - Array of Cloudinary public IDs
 * @param {string} [resourceType='image'] - Resource type
 * @returns {Promise<object>} Cloudinary bulk deletion result
 */
export const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
  try {
    if (publicIds.length === 0) return { deleted: {} };

    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    logger.error(`Cloudinary bulk deletion failed: ${error.message}`);
    throw ApiError.internal('Failed to delete media from Cloudinary');
  }
};

/**
 * Generates a Cloudinary transformation URL.
 *
 * @param {string} publicId - Cloudinary public ID
 * @param {object} [transformations={}] - Transformation options
 * @returns {string} Transformed image URL
 */
export const getTransformedUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations,
  });
};

/**
 * Uploads a file to Cloudinary with local-storage fallback.
 * If Cloudinary is unreachable (e.g., invalid credentials in dev),
 * the file is served from the local /uploads directory.
 *
 * @param {string} filePath - Local file path to upload
 * @param {object} [options={}] - { folder, filename, ...cloudinaryOptions }
 * @returns {Promise<object>} Upload result with isLocal flag
 */
export const uploadWithFallback = async (filePath, options = {}) => {
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

    logger.info(`☁️  Cloudinary upload successful: ${result.secure_url}`);

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
    console.error('Cloudinary Error Details:', error);

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
 * Deletes a resource from Cloudinary. If the publicId indicates a local file,
 * removes it from the local uploads directory instead.
 *
 * @param {string} publicId - Cloudinary public_id or 'local/filename'
 * @param {string} [resourceType='image'] - Resource type
 * @returns {Promise<object>} Deletion result
 */
export const deleteWithFallback = async (publicId, resourceType = 'image') => {
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
 * Removes a local file from disk.
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
