import BaseRepository from './base.repository.js';
import Faq from '../models/Faq.model.js';

/**
 * FAQ Repository.
 * Extends BaseRepository with domain-specific queries for FAQs.
 */
class FaqRepository extends BaseRepository {
  constructor() {
    super(Faq, ['question', 'answer', 'category']);
  }

  /**
   * Finds site-wide global active FAQs.
   *
   * @param {object} [options={}] - Query options
   * @returns {Promise<Document[]>}
   */
  async findGlobalFaqs(options = {}) {
    return this.findMany(
      { isGlobal: true, isActive: true, isDeleted: false },
      {
        sort: { order: 1, createdAt: -1 },
        ...options,
      }
    );
  }

  /**
   * Finds FAQs by service ID. Optionally includes global FAQs.
   *
   * @param {string} serviceId - Service ObjectId
   * @param {boolean} [includeGlobal=false] - If true, include global FAQs alongside service FAQs
   * @returns {Promise<Document[]>}
   */
  async findByService(serviceId, includeGlobal = false) {
    const filter = {
      isActive: true,
      isDeleted: false,
    };

    if (includeGlobal) {
      filter.$or = [{ service: serviceId }, { isGlobal: true }];
    } else {
      filter.service = serviceId;
    }

    return this.findMany(filter, {
      populate: { path: 'service', select: 'title slug' },
      sort: { order: 1, createdAt: -1 },
    });
  }
}

export default new FaqRepository();
