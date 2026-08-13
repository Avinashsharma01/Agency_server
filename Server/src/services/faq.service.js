import faqRepository from '../repositories/faq.repository.js';
import serviceRepository from '../repositories/service.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * FAQ Service.
 * Business logic for service & global FAQs.
 */
class FaqService {
  /**
   * Creates a new FAQ.
   *
   * @param {object} faqData - FAQ payload
   * @returns {Promise<object>} Created FAQ document
   */
  async createFaq(faqData) {
    // If associated with a service, verify service exists
    if (faqData.service) {
      const service = await serviceRepository.findById(faqData.service);
      if (!service || service.isDeleted) {
        throw ApiError.badRequest('Referenced service does not exist');
      }
      faqData.isGlobal = false;
    } else {
      faqData.isGlobal = true;
    }

    const createdFaq = await faqRepository.create(faqData);

    return faqRepository.findById(createdFaq._id, {
      populate: faqData.service ? { path: 'service', select: 'title slug' } : null,
    });
  }

  /**
   * Gets paginated FAQs list.
   *
   * @param {object} queryParams - Express req.query
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getFaqs(queryParams) {
    const extraFilter = {};

    if (queryParams.service) {
      extraFilter.service = queryParams.service;
    }

    if (queryParams.isGlobal !== undefined) {
      extraFilter.isGlobal = queryParams.isGlobal === 'true' || queryParams.isGlobal === true;
    }

    if (queryParams.isActive !== undefined) {
      extraFilter.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
    }

    return faqRepository.findPaginated(queryParams, extraFilter, {
      populate: { path: 'service', select: 'title slug' },
    });
  }

  /**
   * Gets global/general FAQs.
   *
   * @returns {Promise<object[]>} Array of global active FAQs
   */
  async getGlobalFaqs() {
    return faqRepository.findGlobalFaqs();
  }

  /**
   * Gets FAQs for a specific service.
   *
   * @param {string} serviceId - Service ObjectId
   * @param {boolean} [includeGlobal=false] - Whether to append global FAQs
   * @returns {Promise<object[]>} Array of FAQs
   */
  async getFaqsByService(serviceId, includeGlobal = false) {
    const service = await serviceRepository.findById(serviceId);
    if (!service || service.isDeleted) {
      throw ApiError.notFound('Service not found');
    }

    return faqRepository.findByService(serviceId, includeGlobal);
  }

  /**
   * Gets FAQ by ID.
   *
   * @param {string} faqId - FAQ ObjectId
   * @returns {Promise<object>} FAQ document
   */
  async getFaqById(faqId) {
    const faq = await faqRepository.findById(faqId, {
      populate: { path: 'service', select: 'title slug' },
    });

    if (!faq || faq.isDeleted) {
      throw ApiError.notFound('FAQ not found');
    }

    return faq;
  }

  /**
   * Updates an FAQ by ID.
   *
   * @param {string} faqId - FAQ ObjectId
   * @param {object} updateData - Update fields
   * @returns {Promise<object>} Updated FAQ
   */
  async updateFaq(faqId, updateData) {
    const existingFaq = await faqRepository.findById(faqId);
    if (!existingFaq || existingFaq.isDeleted) {
      throw ApiError.notFound('FAQ not found');
    }

    // Verify service if changed
    if (updateData.service && updateData.service !== existingFaq.service?.toString()) {
      const service = await serviceRepository.findById(updateData.service);
      if (!service || service.isDeleted) {
        throw ApiError.badRequest('Referenced service does not exist');
      }
      updateData.isGlobal = false;
    } else if (updateData.service === null) {
      updateData.isGlobal = true;
    }

    return faqRepository.updateById(faqId, updateData, {
      populate: { path: 'service', select: 'title slug' },
    });
  }

  /**
   * Soft deletes an FAQ by ID.
   *
   * @param {string} faqId - FAQ ObjectId
   * @returns {Promise<object>} Soft deleted FAQ
   */
  async deleteFaq(faqId) {
    const faq = await faqRepository.findById(faqId);
    if (!faq || faq.isDeleted) {
      throw ApiError.notFound('FAQ not found');
    }

    return faqRepository.softDeleteById(faqId);
  }
}

export default new FaqService();
