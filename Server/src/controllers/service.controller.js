import serviceService from '../services/service.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Service Controller.
 * Handles HTTP requests for agency services.
 */
class ServiceController {
  /**
   * POST /api/v1/services
   * Creates a new service (Protected: Admin/Manager).
   */
  createService = asyncHandler(async (req, res) => {
    const service = await serviceService.createService(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(service, 'Service created successfully')
    );
  });

  /**
   * GET /api/v1/services
   * Gets paginated services list with query filters (Public).
   */
  getServices = asyncHandler(async (req, res) => {
    const { data, pagination } = await serviceService.getServices(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Services fetched successfully')
    );
  });

  /**
   * GET /api/v1/services/featured
   * Gets featured services (Public).
   */
  getFeaturedServices = asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
    const services = await serviceService.getFeaturedServices(limit);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(services, 'Featured services fetched successfully')
    );
  });

  /**
   * GET /api/v1/services/category/:categoryId
   * Gets services belonging to a specific category (Public).
   */
  getServicesByCategory = asyncHandler(async (req, res) => {
    const { data, pagination } = await serviceService.getServicesByCategory(
      req.params.categoryId,
      req.query
    );

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Category services fetched successfully')
    );
  });

  /**
   * GET /api/v1/services/:id
   * Gets a service by ID (Public).
   */
  getServiceById = asyncHandler(async (req, res) => {
    const service = await serviceService.getServiceById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(service, 'Service fetched successfully')
    );
  });

  /**
   * GET /api/v1/services/slug/:slug
   * Gets a service by Slug (Public).
   */
  getServiceBySlug = asyncHandler(async (req, res) => {
    const service = await serviceService.getServiceBySlug(req.params.slug);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(service, 'Service fetched successfully')
    );
  });

  /**
   * PUT /api/v1/services/:id
   * Updates a service by ID (Protected: Admin/Manager).
   */
  updateService = asyncHandler(async (req, res) => {
    const service = await serviceService.updateService(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(service, 'Service updated successfully')
    );
  });

  /**
   * PUT /api/v1/services/:id/featured-image
   * Uploads or updates the service banner image (Protected: Admin/Manager).
   */
  uploadFeaturedImage = asyncHandler(async (req, res) => {
    const service = await serviceService.uploadFeaturedImage(req.params.id, req.file);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(service, 'Service banner image uploaded successfully')
    );
  });

  /**
   * DELETE /api/v1/services/:id
   * Deletes a service by ID (Protected: Admin/Manager).
   */
  deleteService = asyncHandler(async (req, res) => {
    await serviceService.deleteService(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Service deleted successfully')
    );
  });
}

export default new ServiceController();

