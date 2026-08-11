import categoryService from '../services/category.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Category Controller.
 * Handles HTTP requests for category management.
 */
class CategoryController {
  /**
   * POST /api/v1/categories
   * Creates a new category (Protected: Admin/Manager).
   */
  createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(category, 'Category created successfully')
    );
  });

  /**
   * GET /api/v1/categories
   * Gets categories list with pagination (Public).
   */
  getCategories = asyncHandler(async (req, res) => {
    const { data, pagination } = await categoryService.getCategories(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Categories fetched successfully')
    );
  });

  /**
   * GET /api/v1/categories/active
   * Gets all active categories without pagination (Public).
   */
  getActiveCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getActiveCategories();

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(categories, 'Active categories fetched successfully')
    );
  });

  /**
   * GET /api/v1/categories/:id
   * Gets a category by ID (Public).
   */
  getCategoryById = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(category, 'Category fetched successfully')
    );
  });

  /**
   * GET /api/v1/categories/slug/:slug
   * Gets a category by Slug (Public).
   */
  getCategoryBySlug = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(category, 'Category fetched successfully')
    );
  });

  /**
   * PUT /api/v1/categories/:id
   * Updates a category by ID (Protected: Admin/Manager).
   */
  updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(category, 'Category updated successfully')
    );
  });

  /**
   * DELETE /api/v1/categories/:id
   * Deletes a category by ID (Protected: Admin/Manager).
   */
  deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Category deleted successfully')
    );
  });
}

export default new CategoryController();
