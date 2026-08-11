import packageService from '../services/package.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Package Controller.
 * Handles HTTP requests for pricing packages.
 */
class PackageController {
  /**
   * POST /api/v1/packages
   * Creates a new pricing package (Protected: Admin/Manager).
   */
  createPackage = asyncHandler(async (req, res) => {
    const pkg = await packageService.createPackage(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(pkg, 'Package created successfully')
    );
  });

  /**
   * GET /api/v1/packages
   * Gets paginated packages list (Public).
   */
  getPackages = asyncHandler(async (req, res) => {
    const { data, pagination } = await packageService.getPackages(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Packages fetched successfully')
    );
  });

  /**
   * GET /api/v1/packages/service/:serviceId
   * Gets packages belonging to a specific service (Public).
   */
  getPackagesByService = asyncHandler(async (req, res) => {
    const packages = await packageService.getPackagesByService(req.params.serviceId);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(packages, 'Service packages fetched successfully')
    );
  });

  /**
   * GET /api/v1/packages/:id
   * Gets a package by ID (Public).
   */
  getPackageById = asyncHandler(async (req, res) => {
    const pkg = await packageService.getPackageById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(pkg, 'Package fetched successfully')
    );
  });

  /**
   * PUT /api/v1/packages/:id
   * Updates a package by ID (Protected: Admin/Manager).
   */
  updatePackage = asyncHandler(async (req, res) => {
    const pkg = await packageService.updatePackage(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(pkg, 'Package updated successfully')
    );
  });

  /**
   * DELETE /api/v1/packages/:id
   * Deletes a package by ID (Protected: Admin/Manager).
   */
  deletePackage = asyncHandler(async (req, res) => {
    await packageService.deletePackage(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Package deleted successfully')
    );
  });
}

export default new PackageController();
