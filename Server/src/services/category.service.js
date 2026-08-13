import categoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import slugify from '../utils/slugify.js';

/**
 * Category Service.
 * Implements business logic for service categories.
 */
class CategoryService {
  /**
   * Generates a unique slug for a category.
   *
   * @param {string} text - Base text (e.g. category name)
   * @param {string} [excludeId] - Category ID to exclude when checking uniqueness
   * @returns {Promise<string>} Unique slug string
   */
  async _generateUniqueSlug(text, excludeId = null) {
    let baseSlug = slugify(text);
    let candidateSlug = baseSlug;
    let counter = 1;

    while (await categoryRepository.existsBySlug(candidateSlug, excludeId)) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return candidateSlug;
  }

  /**
   * Creates a new Category.
   *
   * @param {object} categoryData - { name, description, icon, order, isActive }
   * @returns {Promise<object>} Created category
   */
  async createCategory(categoryData) {
    // Check if name is taken
    const exists = await categoryRepository.existsByName(categoryData.name);
    if (exists) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Category with name '${categoryData.name}' already exists`);
    }

    // Generate unique slug
    categoryData.slug = await this._generateUniqueSlug(categoryData.slug || categoryData.name);

    return categoryRepository.create(categoryData);
  }

  /**
   * Gets paginated categories.
   *
   * @param {object} queryParams - Request query parameters
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getCategories(queryParams) {
    return categoryRepository.findPaginated(queryParams);
  }

  /**
   * Gets all active categories (unpaginated, sorted by order).
   *
   * @returns {Promise<object[]>} Array of active categories
   */
  async getActiveCategories() {
    return categoryRepository.findAll(
      { isActive: true, isDeleted: false },
      { sort: { order: 1, name: 1 } }
    );
  }

  /**
   * Gets category by ID.
   *
   * @param {string} categoryId - Category ObjectId
   * @returns {Promise<object>} Category object
   */
  async getCategoryById(categoryId) {
    const category = await categoryRepository.findById(categoryId);
    if (!category || category.isDeleted) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  }

  /**
   * Gets category by Slug.
   *
   * @param {string} slug - Category slug
   * @returns {Promise<object>} Category object
   */
  async getCategoryBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  }

  /**
   * Updates an existing Category.
   *
   * @param {string} categoryId - Category ObjectId
   * @param {object} updateData - Fields to update
   * @returns {Promise<object>} Updated category
   */
  async updateCategory(categoryId, updateData) {
    const category = await categoryRepository.findById(categoryId);
    if (!category || category.isDeleted) {
      throw ApiError.notFound('Category not found');
    }

    // Check name uniqueness if changed
    if (updateData.name && updateData.name.toLowerCase() !== category.name.toLowerCase()) {
      const nameExists = await categoryRepository.existsByName(updateData.name, categoryId);
      if (nameExists) {
        throw new ApiError(HTTP_STATUS.CONFLICT, `Category with name '${updateData.name}' already exists`);
      }
      updateData.slug = await this._generateUniqueSlug(updateData.name, categoryId);
    } else if (updateData.slug && updateData.slug !== category.slug) {
      updateData.slug = await this._generateUniqueSlug(updateData.slug, categoryId);
    }

    return categoryRepository.updateById(categoryId, updateData);
  }

  /**
   * Soft deletes a Category.
   * Blocks deletion if active services are linked to this category.
   *
   * @param {string} categoryId - Category ObjectId
   * @returns {Promise<object>} Soft deleted category
   */
  async deleteCategory(categoryId) {
    const category = await categoryRepository.findById(categoryId);
    if (!category || category.isDeleted) {
      throw ApiError.notFound('Category not found');
    }

    // Dependency check: count services using this category
    const activeServiceCount = await categoryRepository.countServicesByCategory(categoryId);
    if (activeServiceCount > 0) {
      throw ApiError.badRequest(
        `Cannot delete category '${category.name}'. There are ${activeServiceCount} active services associated with it.`
      );
    }

    return categoryRepository.softDeleteById(categoryId);
  }
}

export default new CategoryService();
