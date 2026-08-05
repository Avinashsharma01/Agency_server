import { cloudinary } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { MESSAGES } from '../constants/index.js';

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
    logger.error(`Cloudinary upload failed: ${error.message}`);
    throw ApiError.internal(MESSAGES.MEDIA.UPLOAD_FAILED);
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
