import mediaRepository from '../repositories/media.repository.js';
import {
  uploadWithFallback,
  deleteWithFallback,
  deleteLocalFile,
} from '../helpers/cloudinary.helper.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Media Service.
 * Business logic for Cloudinary media uploads, library management, and deletion.
 */
class MediaService {
  /**
   * Uploads a single file to Cloudinary and creates a Media document.
   *
   * @param {object} file - Multer file object
   * @param {string} userId - Uploader's User ObjectId
   * @param {object} [metadata={}] - Optional { folder, alt, caption }
   * @returns {Promise<object>} Created media document
   */
  async uploadMedia(file, userId, metadata = {}) {
    if (!file) {
      throw ApiError.badRequest('No file provided for upload');
    }

    const folder = metadata.folder || 'general';

    let cloudinaryResult;

    try {
      // Upload to Cloudinary (with local storage fallback)
      cloudinaryResult = await uploadWithFallback(file.path, {
        folder: `agency-cms/${folder}`,
        filename: file.filename,
      });

      // Create Media document in database
      const mediaDoc = await mediaRepository.create({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        format: cloudinaryResult.format,
        size: cloudinaryResult.bytes || file.size,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        publicId: cloudinaryResult.publicId,
        url: cloudinaryResult.url,
        folder,
        alt: metadata.alt || '',
        caption: metadata.caption || '',
        uploadedBy: userId,
      });

      logger.info(`📁 Media uploaded: ${mediaDoc.publicId} by user ${userId}`);

      return mediaRepository.findById(mediaDoc._id, {
        populate: { path: 'uploadedBy', select: 'name email avatar' },
      });
    } finally {
      // Clean up temp local file only if successfully pushed to Cloudinary
      if (cloudinaryResult && !cloudinaryResult.isLocal) {
        deleteLocalFile(file.path);
      }
    }
  }

  /**
   * Uploads multiple files to Cloudinary.
   *
   * @param {object[]} files - Array of Multer file objects
   * @param {string} userId - Uploader's User ObjectId
   * @param {string} [folder='general'] - Cloudinary folder
   * @returns {Promise<object[]>} Array of created media documents
   */
  async uploadMultipleMedia(files, userId, folder = 'general') {
    if (!files || files.length === 0) {
      throw ApiError.badRequest('No files provided for upload');
    }

    const uploadPromises = files.map((file) =>
      this.uploadMedia(file, userId, { folder })
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Gets paginated media library.
   *
   * @param {object} queryParams - Express req.query
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getMedia(queryParams) {
    const extraFilter = {};

    if (queryParams.folder) {
      extraFilter.folder = queryParams.folder;
    }

    if (queryParams.mimeType) {
      extraFilter.mimeType = { $regex: queryParams.mimeType, $options: 'i' };
    }

    if (queryParams.uploadedBy) {
      extraFilter.uploadedBy = queryParams.uploadedBy;
    }

    return mediaRepository.findPaginated(queryParams, extraFilter, {
      populate: { path: 'uploadedBy', select: 'name email avatar' },
    });
  }

  /**
   * Gets a single media document by ID.
   *
   * @param {string} mediaId - Media ObjectId
   * @returns {Promise<object>}
   */
  async getMediaById(mediaId) {
    const media = await mediaRepository.findById(mediaId, {
      populate: { path: 'uploadedBy', select: 'name email avatar' },
    });

    if (!media || media.isDeleted) {
      throw ApiError.notFound('Media not found');
    }

    return media;
  }

  /**
   * Updates media metadata (alt, caption, folder).
   *
   * @param {string} mediaId - Media ObjectId
   * @param {object} updateData - Fields to update
   * @returns {Promise<object>}
   */
  async updateMedia(mediaId, updateData) {
    const media = await mediaRepository.findById(mediaId);
    if (!media || media.isDeleted) {
      throw ApiError.notFound('Media not found');
    }

    return mediaRepository.updateById(mediaId, updateData, {
      populate: { path: 'uploadedBy', select: 'name email avatar' },
    });
  }

  /**
   * Deletes media from Cloudinary and soft deletes the Media document.
   *
   * @param {string} mediaId - Media ObjectId
   * @returns {Promise<object>}
   */
  async deleteMedia(mediaId) {
    const media = await mediaRepository.findById(mediaId);
    if (!media || media.isDeleted) {
      throw ApiError.notFound('Media not found');
    }

    // Delete from Cloudinary
    try {
      const resourceType = media.mimeType?.startsWith('video') ? 'video' : 'image';
      await deleteWithFallback(media.publicId, resourceType);
    } catch (error) {
      logger.warn(`⚠️  Cloudinary deletion failed for ${media.publicId}, proceeding with DB soft delete: ${error.message}`);
    }

    // Soft delete from database
    return mediaRepository.softDeleteById(mediaId);
  }
}

export default new MediaService();
