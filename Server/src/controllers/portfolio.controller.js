import portfolioService from '../services/portfolio.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Portfolio Controller.
 * Handles HTTP requests for portfolio projects.
 */
class PortfolioController {
  /**
   * POST /api/v1/portfolio
   * Creates a new portfolio item (Protected: Admin/Manager/Editor).
   */
  createPortfolio = asyncHandler(async (req, res) => {
    const portfolio = await portfolioService.createPortfolio(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(portfolio, 'Portfolio project created successfully')
    );
  });

  /**
   * GET /api/v1/portfolio
   * Gets paginated portfolio items (Public).
   */
  getPortfolios = asyncHandler(async (req, res) => {
    const { data, pagination } = await portfolioService.getPortfolios(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Portfolio items fetched successfully')
    );
  });

  /**
   * GET /api/v1/portfolio/featured
   * Gets featured portfolio items (Public).
   */
  getFeaturedProjects = asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
    const projects = await portfolioService.getFeaturedProjects(limit);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(projects, 'Featured portfolio items fetched successfully')
    );
  });

  /**
   * GET /api/v1/portfolio/slug/:slug
   * Gets portfolio item by slug (Public).
   */
  getPortfolioBySlug = asyncHandler(async (req, res) => {
    const portfolio = await portfolioService.getPortfolioBySlug(req.params.slug);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(portfolio, 'Portfolio item fetched successfully')
    );
  });

  /**
   * GET /api/v1/portfolio/:id
   * Gets portfolio item by ID (Public).
   */
  getPortfolioById = asyncHandler(async (req, res) => {
    const portfolio = await portfolioService.getPortfolioById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(portfolio, 'Portfolio item fetched successfully')
    );
  });

  /**
   * PUT /api/v1/portfolio/:id
   * Updates a portfolio item by ID (Protected: Admin/Manager/Editor).
   */
  updatePortfolio = asyncHandler(async (req, res) => {
    const portfolio = await portfolioService.updatePortfolio(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(portfolio, 'Portfolio item updated successfully')
    );
  });

  /**
   * DELETE /api/v1/portfolio/:id
   * Deletes a portfolio item by ID (Protected: Admin/Manager/Editor).
   */
  deletePortfolio = asyncHandler(async (req, res) => {
    await portfolioService.deletePortfolio(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Portfolio item deleted successfully')
    );
  });
}

export default new PortfolioController();
