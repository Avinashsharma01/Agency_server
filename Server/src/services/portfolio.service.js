import portfolioRepository from '../repositories/portfolio.repository.js';
import categoryRepository from '../repositories/category.repository.js';
import serviceRepository from '../repositories/service.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import slugify from '../utils/slugify.js';

/**
 * Portfolio Service.
 * Business logic for portfolio items and galleries.
 */
class PortfolioService {
  /**
   * Generates a unique slug for a portfolio project.
   *
   * @param {string} text - Base title
   * @param {string} [excludeId] - ID to exclude
   * @returns {Promise<string>}
   */
  async _generateUniqueSlug(text, excludeId = null) {
    let baseSlug = slugify(text);
    let candidateSlug = baseSlug;
    let counter = 1;

    while (await portfolioRepository.existsBySlug(candidateSlug, excludeId)) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return candidateSlug;
  }

  /**
   * Creates a new Portfolio item.
   *
   * @param {object} portfolioData - Payload
   * @returns {Promise<object>} Created portfolio document
   */
  async createPortfolio(portfolioData) {
    // Verify category exists
    const category = await categoryRepository.findById(portfolioData.category);
    if (!category || category.isDeleted) {
      throw ApiError.badRequest('Referenced category does not exist');
    }

    // Verify service if passed
    if (portfolioData.service) {
      const service = await serviceRepository.findById(portfolioData.service);
      if (!service || service.isDeleted) {
        throw ApiError.badRequest('Referenced service does not exist');
      }
    }

    // Title uniqueness check
    const titleExists = await portfolioRepository.existsByTitle(portfolioData.title);
    if (titleExists) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Portfolio project with title '${portfolioData.title}' already exists`);
    }

    // Generate unique slug
    portfolioData.slug = await this._generateUniqueSlug(portfolioData.slug || portfolioData.title);

    const createdItem = await portfolioRepository.create(portfolioData);

    return portfolioRepository.findById(createdItem._id, {
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'service', select: 'title slug icon' },
      ],
    });
  }

  /**
   * Gets paginated portfolio items.
   *
   * @param {object} queryParams - Express req.query
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getPortfolios(queryParams) {
    const extraFilter = {};

    if (queryParams.category) {
      extraFilter.category = queryParams.category;
    }

    if (queryParams.service) {
      extraFilter.service = queryParams.service;
    }

    if (queryParams.isActive !== undefined) {
      extraFilter.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
    }

    if (queryParams.isFeatured !== undefined) {
      extraFilter.isFeatured = queryParams.isFeatured === 'true' || queryParams.isFeatured === true;
    }

    return portfolioRepository.findPaginated(queryParams, extraFilter, {
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'service', select: 'title slug icon' },
      ],
    });
  }

  /**
   * Gets featured portfolio items.
   *
   * @param {number} [limit=6] - Limit
   * @returns {Promise<object[]>}
   */
  async getFeaturedProjects(limit = 6) {
    return portfolioRepository.getFeaturedProjects(limit);
  }

  /**
   * Gets portfolio item by ID.
   *
   * @param {string} portfolioId - Portfolio ObjectId
   * @returns {Promise<object>}
   */
  async getPortfolioById(portfolioId) {
    const item = await portfolioRepository.findById(portfolioId, {
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'service', select: 'title slug icon' },
      ],
    });

    if (!item || item.isDeleted) {
      throw ApiError.notFound('Portfolio item not found');
    }

    return item;
  }

  /**
   * Gets portfolio item by Slug.
   *
   * @param {string} slug - Project slug
   * @returns {Promise<object>}
   */
  async getPortfolioBySlug(slug) {
    const item = await portfolioRepository.findBySlug(slug);

    if (!item) {
      throw ApiError.notFound('Portfolio item not found');
    }

    return item;
  }

  /**
   * Updates a portfolio item.
   *
   * @param {string} portfolioId - Portfolio ObjectId
   * @param {object} updateData - Fields to update
   * @returns {Promise<object>} Updated item
   */
  async updatePortfolio(portfolioId, updateData) {
    const existing = await portfolioRepository.findById(portfolioId);
    if (!existing || existing.isDeleted) {
      throw ApiError.notFound('Portfolio item not found');
    }

    // Verify category if changed
    if (updateData.category && updateData.category !== existing.category?.toString()) {
      const category = await categoryRepository.findById(updateData.category);
      if (!category || category.isDeleted) {
        throw ApiError.badRequest('Referenced category does not exist');
      }
    }

    // Verify service if changed
    if (updateData.service && updateData.service !== existing.service?.toString()) {
      const service = await serviceRepository.findById(updateData.service);
      if (!service || service.isDeleted) {
        throw ApiError.badRequest('Referenced service does not exist');
      }
    }

    // Handle title and slug update
    if (updateData.title && updateData.title.toLowerCase() !== existing.title.toLowerCase()) {
      const titleExists = await portfolioRepository.existsByTitle(updateData.title, portfolioId);
      if (titleExists) {
        throw new ApiError(HTTP_STATUS.CONFLICT, `Portfolio project with title '${updateData.title}' already exists`);
      }
      updateData.slug = await this._generateUniqueSlug(updateData.title, portfolioId);
    } else if (updateData.slug && updateData.slug !== existing.slug) {
      updateData.slug = await this._generateUniqueSlug(updateData.slug, portfolioId);
    }

    return portfolioRepository.updateById(portfolioId, updateData, {
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'service', select: 'title slug icon' },
      ],
    });
  }

  /**
   * Soft deletes a portfolio item.
   *
   * @param {string} portfolioId - Portfolio ObjectId
   * @returns {Promise<object>}
   */
  async deletePortfolio(portfolioId) {
    const item = await portfolioRepository.findById(portfolioId);
    if (!item || item.isDeleted) {
      throw ApiError.notFound('Portfolio item not found');
    }

    return portfolioRepository.softDeleteById(portfolioId);
  }
}

export default new PortfolioService();
