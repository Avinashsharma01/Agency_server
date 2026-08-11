import BaseRepository from './base.repository.js';
import Category from '../models/Category.model.js';
import Service from '../models/Service.model.js';

/**
 * Category Repository.
 * Extends BaseRepository with domain-specific category queries.
 */
class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category, ['name', 'description']);
  }

  /**
   * Finds a category by unique slug.
   *
   * @param {string} slug - Category slug
   * @param {object} [options={}] - Options { lean }
   * @returns {Promise<Document|null>} Category document
   */
  async findBySlug(slug, options = {}) {
    return this.findOne({ slug: slug.toLowerCase(), isDeleted: false }, options);
  }

  /**
   * Checks if a category name already exists (case-insensitive).
   *
   * @param {string} name - Category name
   * @param {string} [excludeId] - Category ID to exclude (for update checks)
   * @returns {Promise<boolean>} True if category exists
   */
  async existsByName(name, excludeId = null) {
    const filter = {
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      isDeleted: false,
    };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return this.exists(filter);
  }

  /**
   * Checks if a category slug already exists.
   *
   * @param {string} slug - Category slug
   * @param {string} [excludeId] - Category ID to exclude
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
   * Counts active services linked to a category.
   * Used to prevent deletion of categories with active services.
   *
   * @param {string} categoryId - Category ObjectId
   * @returns {Promise<number>} Number of active services
   */
  async countServicesByCategory(categoryId) {
    return Service.countDocuments({
      category: categoryId,
      isDeleted: false,
    });
  }
}

export default new CategoryRepository();
