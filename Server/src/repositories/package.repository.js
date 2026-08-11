import BaseRepository from './base.repository.js';
import Package from '../models/Package.model.js';

/**
 * Package Repository.
 * Extends BaseRepository with domain-specific queries for pricing packages.
 */
class PackageRepository extends BaseRepository {
  constructor() {
    super(Package, ['name', 'description']);
  }

  /**
   * Finds all active packages for a given service.
   *
   * @param {string} serviceId - Service ObjectId
   * @param {object} [options={}] - Query options
   * @returns {Promise<Document[]>} Array of active packages
   */
  async findByService(serviceId, options = {}) {
    return this.findMany(
      { service: serviceId, isActive: true, isDeleted: false },
      {
        populate: { path: 'service', select: 'title slug icon' },
        sort: { order: 1, price: 1 },
        ...options,
      }
    );
  }

  /**
   * Finds package by ID with service details populated.
   *
   * @param {string} packageId - Package ObjectId
   * @param {object} [options={}] - Options
   * @returns {Promise<Document|null>}
   */
  async findByIdWithService(packageId, options = {}) {
    return this.findById(packageId, {
      populate: { path: 'service', select: 'title slug icon' },
      ...options,
    });
  }
}

export default new PackageRepository();
