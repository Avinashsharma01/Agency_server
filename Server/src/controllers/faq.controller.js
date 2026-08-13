import faqService from '../services/faq.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * FAQ Controller.
 * Handles HTTP requests for FAQs.
 */
class FaqController {
  /**
   * POST /api/v1/faqs
   * Creates a new FAQ (Protected: Admin/Manager).
   */
  createFaq = asyncHandler(async (req, res) => {
    const faq = await faqService.createFaq(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(faq, 'FAQ created successfully')
    );
  });

  /**
   * GET /api/v1/faqs
   * Gets paginated FAQs list (Public).
   */
  getFaqs = asyncHandler(async (req, res) => {
    const { data, pagination } = await faqService.getFaqs(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'FAQs fetched successfully')
    );
  });

  /**
   * GET /api/v1/faqs/global
   * Gets all global/general FAQs (Public).
   */
  getGlobalFaqs = asyncHandler(async (req, res) => {
    const faqs = await faqService.getGlobalFaqs();

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(faqs, 'Global FAQs fetched successfully')
    );
  });

  /**
   * GET /api/v1/faqs/service/:serviceId
   * Gets FAQs for a specific service (Public).
   */
  getFaqsByService = asyncHandler(async (req, res) => {
    const includeGlobal = req.query.includeGlobal === 'true';
    const faqs = await faqService.getFaqsByService(req.params.serviceId, includeGlobal);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(faqs, 'Service FAQs fetched successfully')
    );
  });

  /**
   * GET /api/v1/faqs/:id
   * Gets an FAQ by ID (Public).
   */
  getFaqById = asyncHandler(async (req, res) => {
    const faq = await faqService.getFaqById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(faq, 'FAQ fetched successfully')
    );
  });

  /**
   * PUT /api/v1/faqs/:id
   * Updates an FAQ by ID (Protected: Admin/Manager).
   */
  updateFaq = asyncHandler(async (req, res) => {
    const faq = await faqService.updateFaq(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(faq, 'FAQ updated successfully')
    );
  });

  /**
   * DELETE /api/v1/faqs/:id
   * Deletes an FAQ by ID (Protected: Admin/Manager).
   */
  deleteFaq = asyncHandler(async (req, res) => {
    await faqService.deleteFaq(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'FAQ deleted successfully')
    );
  });
}

export default new FaqController();
