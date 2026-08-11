import BaseRepository from './base.repository.js';
import Portfolio from '../models/Portfolio.model.js';

/**
 * Portfolio Repository.
 * Extends BaseRepository with domain-specific portfolio queries.
 */
class PortfolioRepository extends BaseRepository {
  constructor() {
    super(Portfolio, ['title', 'shortDescription', 'fullDescription', 'client', 'technologies']);
  }

  /**
   * Finds a portfolio project by slug with populated references.
   *
   * @param {string} slug - Project slug
   * @param {object} [options={}] - Query options
   * @returns {Promise<Document|null>}
   */
  async findBySlug(slug, options = {}) {
    return this.findOne(
      { slug: slug.toLowerCase(), isDeleted: false },
      {
        populate: [
          { path: 'category', select: 'name slug icon' },
          { path: 'service', select: 'title slug icon' },
        ],
        ...options,
      }
    );
  }

  /**
   * Checks if a title already exists (case-insensitive).
   *
   * @param {string} title - Portfolio title
   * @param {string} [excludeId] - Portfolio ID to exclude
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
   * Checks if a slug already exists.
   *
   * @param {string} slug - Portfolio slug
   * @param {string} [excludeId] - Portfolio ID to exclude
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
   * Gets featured active projects.
   *
   * @param {number} [limit=6] - Limit
   * @returns {Promise<Document[]>}
   */
  async getFeaturedProjects(limit = 6) {
    return this.findMany(
      { isFeatured: true, isActive: true, isDeleted: false },
      {
        populate: [
          { path: 'category', select: 'name slug icon' },
          { path: 'service', select: 'title slug icon' },
        ],
        sort: { order: 1, createdAt: -1 },
        limit,
      }
    );
  }
}

export default new PortfolioRepository();
