import testimonialRepository from '../repositories/testimonial.repository.js';
import serviceRepository from '../repositories/service.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * Testimonial Service.
 * Business logic for client reviews and testimonials.
 */
class TestimonialService {
  /**
   * Creates a new Testimonial.
   *
   * @param {object} testimonialData - Payload
   * @returns {Promise<object>} Created testimonial document
   */
  async createTestimonial(testimonialData) {
    // Verify service if passed
    if (testimonialData.service) {
      const service = await serviceRepository.findById(testimonialData.service);
      if (!service || service.isDeleted) {
        throw ApiError.badRequest('Referenced service does not exist');
      }
    }

    const created = await testimonialRepository.create(testimonialData);

    return testimonialRepository.findById(created._id, {
      populate: { path: 'service', select: 'title slug' },
    });
  }

  /**
   * Gets paginated testimonials.
   *
   * @param {object} queryParams - Express req.query
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getTestimonials(queryParams) {
    const extraFilter = {};

    if (queryParams.service) {
      extraFilter.service = queryParams.service;
    }

    if (queryParams.isFeatured !== undefined) {
      extraFilter.isFeatured = queryParams.isFeatured === 'true' || queryParams.isFeatured === true;
    }

    if (queryParams.isActive !== undefined) {
      extraFilter.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
    }

    return testimonialRepository.findPaginated(queryParams, extraFilter, {
      populate: { path: 'service', select: 'title slug' },
    });
  }

  /**
   * Gets featured testimonials for homepage showcase.
   *
   * @param {number} [limit=6] - Limit
   * @returns {Promise<object[]>}
   */
  async getFeaturedTestimonials(limit = 6) {
    return testimonialRepository.findFeaturedTestimonials(limit);
  }

  /**
   * Gets a testimonial by ID.
   *
   * @param {string} testimonialId - Testimonial ObjectId
   * @returns {Promise<object>}
   */
  async getTestimonialById(testimonialId) {
    const item = await testimonialRepository.findById(testimonialId, {
      populate: { path: 'service', select: 'title slug' },
    });

    if (!item || item.isDeleted) {
      throw ApiError.notFound('Testimonial not found');
    }

    return item;
  }

  /**
   * Updates a testimonial by ID.
   *
   * @param {string} testimonialId - Testimonial ObjectId
   * @param {object} updateData - Update fields
   * @returns {Promise<object>}
   */
  async updateTestimonial(testimonialId, updateData) {
    const existing = await testimonialRepository.findById(testimonialId);
    if (!existing || existing.isDeleted) {
      throw ApiError.notFound('Testimonial not found');
    }

    // Verify service if changed
    if (updateData.service && updateData.service !== existing.service?.toString()) {
      const service = await serviceRepository.findById(updateData.service);
      if (!service || service.isDeleted) {
        throw ApiError.badRequest('Referenced service does not exist');
      }
    }

    return testimonialRepository.updateById(testimonialId, updateData, {
      populate: { path: 'service', select: 'title slug' },
    });
  }

  /**
   * Soft deletes a testimonial.
   *
   * @param {string} testimonialId - Testimonial ObjectId
   * @returns {Promise<object>}
   */
  async deleteTestimonial(testimonialId) {
    const item = await testimonialRepository.findById(testimonialId);
    if (!item || item.isDeleted) {
      throw ApiError.notFound('Testimonial not found');
    }

    return testimonialRepository.softDeleteById(testimonialId);
  }
}

export default new TestimonialService();
