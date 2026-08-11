import packageRepository from '../repositories/package.repository.js';
import serviceRepository from '../repositories/service.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * Package Service.
 * Business logic for service pricing packages.
 */
class PackageService {
  /**
   * Creates a new Package.
   *
   * @param {object} packageData - Package payload
   * @returns {Promise<object>} Created package document
   */
  async createPackage(packageData) {
    // Verify referenced service exists
    const service = await serviceRepository.findById(packageData.service);
    if (!service || service.isDeleted) {
      throw ApiError.badRequest('Referenced service does not exist');
    }

    const createdPackage = await packageRepository.create(packageData);

    return packageRepository.findByIdWithService(createdPackage._id);
  }

  /**
   * Gets paginated list of packages with optional filters.
   *
   * @param {object} queryParams - Express req.query
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getPackages(queryParams) {
    const extraFilter = {};

    if (queryParams.service) {
      extraFilter.service = queryParams.service;
    }

    if (queryParams.packageType) {
      extraFilter.packageType = queryParams.packageType;
    }

    if (queryParams.billingPeriod) {
      extraFilter.billingPeriod = queryParams.billingPeriod;
    }

    if (queryParams.isActive !== undefined) {
      extraFilter.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
    }

    return packageRepository.findPaginated(queryParams, extraFilter, {
      populate: { path: 'service', select: 'title slug icon' },
    });
  }

  /**
   * Gets all active packages for a specific service.
   *
   * @param {string} serviceId - Service ObjectId
   * @returns {Promise<object[]>} Array of active packages
   */
  async getPackagesByService(serviceId) {
    const service = await serviceRepository.findById(serviceId);
    if (!service || service.isDeleted) {
      throw ApiError.notFound('Service not found');
    }

    return packageRepository.findByService(serviceId);
  }

  /**
   * Gets a package by ID.
   *
   * @param {string} packageId - Package ObjectId
   * @returns {Promise<object>} Package document
   */
  async getPackageById(packageId) {
    const pkg = await packageRepository.findByIdWithService(packageId);

    if (!pkg || pkg.isDeleted) {
      throw ApiError.notFound('Package not found');
    }

    return pkg;
  }

  /**
   * Updates a package by ID.
   *
   * @param {string} packageId - Package ObjectId
   * @param {object} updateData - Update data
   * @returns {Promise<object>} Updated package
   */
  async updatePackage(packageId, updateData) {
    const existingPackage = await packageRepository.findById(packageId);
    if (!existingPackage || existingPackage.isDeleted) {
      throw ApiError.notFound('Package not found');
    }

    // Verify service if being updated
    if (updateData.service && updateData.service !== existingPackage.service.toString()) {
      const service = await serviceRepository.findById(updateData.service);
      if (!service || service.isDeleted) {
        throw ApiError.badRequest('Referenced service does not exist');
      }
    }

    return packageRepository.updateById(packageId, updateData, {
      populate: { path: 'service', select: 'title slug icon' },
    });
  }

  /**
   * Soft deletes a package.
   *
   * @param {string} packageId - Package ObjectId
   * @returns {Promise<object>} Soft-deleted package
   */
  async deletePackage(packageId) {
    const pkg = await packageRepository.findById(packageId);
    if (!pkg || pkg.isDeleted) {
      throw ApiError.notFound('Package not found');
    }

    return packageRepository.softDeleteById(packageId);
  }
}

export default new PackageService();
