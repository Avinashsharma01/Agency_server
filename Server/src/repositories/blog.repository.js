import BaseRepository from './base.repository.js';
import Blog from '../models/Blog.model.js';

/**
 * Blog Repository.
 * Extends BaseRepository with domain-specific blog queries.
 */
class BlogRepository extends BaseRepository {
  constructor() {
    super(Blog, ['title', 'content', 'excerpt', 'tags']);
  }

  /**
   * Finds a blog post by slug with category and author populated.
   *
   * @param {string} slug - Blog slug
   * @param {object} [options={}] - Query options
   * @returns {Promise<Document|null>}
   */
  async findBySlug(slug, options = {}) {
    return this.findOne(
      { slug: slug.toLowerCase(), isDeleted: false },
      {
        populate: [
          { path: 'category', select: 'name slug icon' },
          { path: 'author', select: 'name email avatar' },
        ],
        ...options,
      }
    );
  }

  /**
   * Checks if a blog title already exists (case-insensitive).
   *
   * @param {string} title - Blog title
   * @param {string} [excludeId] - Blog ID to exclude
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
   * @param {string} slug - Blog slug
   * @param {string} [excludeId] - Blog ID to exclude
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
   * Increments the view count for a blog post.
   *
   * @param {string} blogId - Blog ObjectId
   * @returns {Promise<Document|null>}
   */
  async incrementViewsCount(blogId) {
    return this.model.findByIdAndUpdate(
      blogId,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
  }
}

export default new BlogRepository();
