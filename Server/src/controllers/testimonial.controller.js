import testimonialService from '../services/testimonial.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Testimonial Controller.
 * Handles HTTP requests for client testimonials.
 */
class TestimonialController {
  /**
   * POST /api/v1/testimonials
   * Creates a new testimonial (Protected: Admin/Manager).
   */
  createTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await testimonialService.createTestimonial(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(testimonial, 'Testimonial created successfully')
    );
  });

  /**
   * GET /api/v1/testimonials
   * Gets paginated testimonials (Public).
   */
  getTestimonials = asyncHandler(async (req, res) => {
    const { data, pagination } = await testimonialService.getTestimonials(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Testimonials fetched successfully')
    );
  });

  /**
   * GET /api/v1/testimonials/featured
   * Gets featured testimonials for homepage showcase (Public).
   */
  getFeaturedTestimonials = asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
    const testimonials = await testimonialService.getFeaturedTestimonials(limit);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(testimonials, 'Featured testimonials fetched successfully')
    );
  });

  /**
   * GET /api/v1/testimonials/:id
   * Gets a testimonial by ID (Public).
   */
  getTestimonialById = asyncHandler(async (req, res) => {
    const testimonial = await testimonialService.getTestimonialById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(testimonial, 'Testimonial fetched successfully')
    );
  });

  /**
   * PUT /api/v1/testimonials/:id
   * Updates a testimonial by ID (Protected: Admin/Manager).
   */
  updateTestimonial = asyncHandler(async (req, res) => {
    const testimonial = await testimonialService.updateTestimonial(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(testimonial, 'Testimonial updated successfully')
    );
  });

  /**
   * DELETE /api/v1/testimonials/:id
   * Deletes a testimonial by ID (Protected: Admin/Manager).
   */
  deleteTestimonial = asyncHandler(async (req, res) => {
    await testimonialService.deleteTestimonial(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Testimonial deleted successfully')
    );
  });
}

export default new TestimonialController();
