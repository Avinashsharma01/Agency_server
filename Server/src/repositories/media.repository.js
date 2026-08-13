import BaseRepository from './base.repository.js';
import Media from '../models/Media.model.js';

/**
 * Media Repository.
 * Data access layer for Cloudinary media assets.
 */
class MediaRepository extends BaseRepository {
  constructor() {
    super(Media, ['filename', 'originalName', 'alt', 'caption']);
  }

  /**
   * Finds a media document by Cloudinary publicId.
   *
   * @param {string} publicId - Cloudinary public_id
   * @returns {Promise<Document|null>}
   */
  async findByPublicId(publicId) {
    return this.findOne({ publicId, isDeleted: false });
  }

  /**
   * Finds media documents by folder.
   *
   * @param {string} folder - Folder name
   * @param {object} [options={}] - Query options
   * @returns {Promise<Document[]>}
   */
  async findByFolder(folder, options = {}) {
    return this.findMany(
      { folder, isDeleted: false },
      { sort: { createdAt: -1 }, ...options }
    );
  }
}

export default new MediaRepository();
