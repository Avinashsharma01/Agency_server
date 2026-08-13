import BaseRepository from './base.repository.js';
import Testimonial from '../models/Testimonial.model.js';

/**
 * Testimonial Repository.
 * Data access layer for client testimonials.
 */
class TestimonialRepository extends BaseRepository {
  constructor() {
    super(Testimonial, ['clientName', 'clientCompany', 'content']);
  }

  /**
   * Finds featured active testimonials.
   *
   * @param {number} [limit=6] - Limit
   * @returns {Promise<Document[]>}
   */
  async findFeaturedTestimonials(limit = 6) {
    return this.findMany(
      { isFeatured: true, isActive: true, isDeleted: false },
      {
        populate: { path: 'service', select: 'title slug' },
        sort: { order: 1, createdAt: -1 },
        limit,
      }
    );
  }
}

export default new TestimonialRepository();
