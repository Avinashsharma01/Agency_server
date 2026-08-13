import serviceRepository from '../repositories/service.repository.js';
import categoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import slugify from '../utils/slugify.js';

/**
 * Service Business Logic Service.
 * Handles service management, category association, and slug management.
 */
class ServiceService {
  /**
   * Generates a unique slug for a service.
   *
   * @param {string} text - Base text (e.g. title)
   * @param {string} [excludeId] - Service ID to exclude
   * @returns {Promise<string>} Unique slug
   */
  async _generateUniqueSlug(text, excludeId = null) {
    let baseSlug = slugify(text);
    let candidateSlug = baseSlug;
    let counter = 1;

    while (await serviceRepository.existsBySlug(candidateSlug, excludeId)) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return candidateSlug;
  }

  /**
   * Creates a new Service.
   *
   * @param {object} serviceData - Service input data
   * @returns {Promise<object>} Created service with category populated
   */
  async createService(serviceData) {
    // Verify category exists
    const category = await categoryRepository.findById(serviceData.category);
    if (!category || category.isDeleted) {
      throw ApiError.badRequest('Specified category does not exist');
    }

    // Check title uniqueness
    const titleExists = await serviceRepository.existsByTitle(serviceData.title);
    if (titleExists) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Service with title '${serviceData.title}' already exists`);
    }

    // Generate unique slug
    serviceData.slug = await this._generateUniqueSlug(serviceData.slug || serviceData.title);

    const service = await serviceRepository.create(serviceData);

    return serviceRepository.findById(service._id, {
      populate: { path: 'category', select: 'name slug icon' },
    });
  }

  /**
   * Gets paginated services list.
   *
   * @param {object} queryParams - Express req.query
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getServices(queryParams) {
    const extraFilter = {};

    // Apply category filter if passed in query
    if (queryParams.category) {
      extraFilter.category = queryParams.category;
    }

    // Apply boolean status filters if explicitly passed
    if (queryParams.isActive !== undefined) {
      extraFilter.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
    }

    if (queryParams.isFeatured !== undefined) {
      extraFilter.isFeatured = queryParams.isFeatured === 'true' || queryParams.isFeatured === true;
    }

    return serviceRepository.findPaginated(queryParams, extraFilter, {
      populate: { path: 'category', select: 'name slug icon' },
    });
  }

  /**
   * Gets a single service by ID.
   *
   * @param {string} serviceId - Service ObjectId
   * @returns {Promise<object>} Service document
   */
  async getServiceById(serviceId) {
    const service = await serviceRepository.findById(serviceId, {
      populate: { path: 'category', select: 'name slug icon' },
    });

    if (!service || service.isDeleted) {
      throw ApiError.notFound('Service not found');
    }

    return service;
  }

  /**
   * Gets a single service by Slug.
   *
   * @param {string} slug - Service slug
   * @returns {Promise<object>} Service document
   */
  async getServiceBySlug(slug) {
    const service = await serviceRepository.findBySlug(slug);

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    return service;
  }

  /**
   * Gets services belonging to a specific category.
   *
   * @param {string} categoryId - Category ObjectId
   * @param {object} queryParams - Pagination query parameters
   * @returns {Promise<object>} Paginated services
   */
  async getServicesByCategory(categoryId, queryParams) {
    const category = await categoryRepository.findById(categoryId);
    if (!category || category.isDeleted) {
      throw ApiError.notFound('Category not found');
    }

    return serviceRepository.findByCategory(categoryId, queryParams);
  }

  /**
   * Gets featured services for homepage/showcase.
   *
   * @param {number} [limit=6] - Limit count
   * @returns {Promise<object[]>} Array of featured services
   */
  async getFeaturedServices(limit = 6) {
    return serviceRepository.getFeaturedServices(limit);
  }

  /**
   * Updates an existing Service.
   *
   * @param {string} serviceId - Service ObjectId
   * @param {object} updateData - Update data
   * @returns {Promise<object>} Updated service
   */
  async updateService(serviceId, updateData) {
    const existingService = await serviceRepository.findById(serviceId);
    if (!existingService || existingService.isDeleted) {
      throw ApiError.notFound('Service not found');
    }

    // Verify category if changed
    if (updateData.category && updateData.category !== existingService.category.toString()) {
      const category = await categoryRepository.findById(updateData.category);
      if (!category || category.isDeleted) {
        throw ApiError.badRequest('Specified category does not exist');
      }
    }

    // Check title uniqueness and slug update
    if (updateData.title && updateData.title.toLowerCase() !== existingService.title.toLowerCase()) {
      const titleExists = await serviceRepository.existsByTitle(updateData.title, serviceId);
      if (titleExists) {
        throw new ApiError(HTTP_STATUS.CONFLICT, `Service with title '${updateData.title}' already exists`);
      }
      updateData.slug = await this._generateUniqueSlug(updateData.title, serviceId);
    } else if (updateData.slug && updateData.slug !== existingService.slug) {
      updateData.slug = await this._generateUniqueSlug(updateData.slug, serviceId);
    }

    return serviceRepository.updateById(serviceId, updateData, {
      populate: { path: 'category', select: 'name slug icon' },
    });
  }

  /**
   * Soft deletes a Service.
   *
   * @param {string} serviceId - Service ObjectId
   * @returns {Promise<object>} Soft deleted service
   */
  async deleteService(serviceId) {
    const service = await serviceRepository.findById(serviceId);
    if (!service || service.isDeleted) {
      throw ApiError.notFound('Service not found');
    }

    return serviceRepository.softDeleteById(serviceId);
  }
}

export default new ServiceService();
