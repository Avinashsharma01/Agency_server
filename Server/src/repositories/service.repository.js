import BaseRepository from './base.repository.js';
import Service from '../models/Service.model.js';

/**
 * Service Repository.
 * Extends BaseRepository with domain-specific service queries.
 */
class ServiceRepository extends BaseRepository {
  constructor() {
    super(Service, ['title', 'shortDescription', 'fullDescription', 'tags']);
  }

  /**
   * Finds a service by slug with category populated.
   *
   * @param {string} slug - Service slug
   * @param {object} [options={}] - Query options
   * @returns {Promise<Document|null>} Service document
   */
  async findBySlug(slug, options = {}) {
    return this.findOne(
      { slug: slug.toLowerCase(), isDeleted: false },
      {
        populate: { path: 'category', select: 'name slug icon' },
        ...options,
      }
    );
  }

  /**
   * Checks if a service title already exists (case-insensitive).
   *
   * @param {string} title - Service title
   * @param {string} [excludeId] - Service ID to exclude
   * @returns {Promise<boolean>}
   */
  async existsByTitle(title, excludeId = null) {
    const filter = {
      title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
      isDeleted: false,
    };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return this.exists(filter);
  }

  /**
   * Checks if a service slug already exists.
   *
   * @param {string} slug - Service slug
   * @param {string} [excludeId] - Service ID to exclude
   * @returns {Promise<boolean>}
   */
  async existsBySlug(slug, excludeId = null) {
    const filter = { slug: slug.toLowerCase(), isDeleted: false };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return this.exists(filter);
  }

  /**
   * Finds all active services belonging to a category.
   *
   * @param {string} categoryId - Category ObjectId
   * @param {object} [queryParams={}] - Query params for pagination/sorting
   * @returns {Promise<object>} Paginated services list
   */
  async findByCategory(categoryId, queryParams = {}) {
    const extraFilter = { category: categoryId, isActive: true };
    return this.findPaginated(queryParams, extraFilter, {
      populate: { path: 'category', select: 'name slug icon' },
    });
  }

  /**
   * Gets featured active services for showcase/homepage.
   *
   * @param {number} [limit=6] - Max items to return
   * @returns {Promise<Document[]>} Array of featured services
   */
  async getFeaturedServices(limit = 6) {
    return this.findMany(
      { isFeatured: true, isActive: true, isDeleted: false },
      {
        populate: { path: 'category', select: 'name slug icon' },
        sort: { order: 1, createdAt: -1 },
        limit,
      }
    );
  }
}

export default new ServiceRepository();
