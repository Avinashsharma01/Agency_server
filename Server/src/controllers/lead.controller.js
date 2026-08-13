import leadService from '../services/lead.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Lead Controller.
 * Handles contact form submissions and lead management.
 */
class LeadController {
  /**
   * POST /api/v1/leads
   * Submits a public lead / contact inquiry form (Public).
   */
  createLead = asyncHandler(async (req, res) => {
    const clientMetadata = {
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.get('user-agent') || '',
    };

    const lead = await leadService.createLead(req.body, clientMetadata);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(lead, 'Thank you! Your message has been received. We will contact you shortly.')
    );
  });

  /**
   * GET /api/v1/leads
   * Gets paginated leads list (Protected: Admin/Manager).
   */
  getLeads = asyncHandler(async (req, res) => {
    const { data, pagination } = await leadService.getLeads(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Leads fetched successfully')
    );
  });

  /**
   * GET /api/v1/leads/:id
   * Gets lead details by ID (Protected: Admin/Manager).
   */
  getLeadById = asyncHandler(async (req, res) => {
    const lead = await leadService.getLeadById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(lead, 'Lead details fetched successfully')
    );
  });

  /**
   * PUT /api/v1/leads/:id
   * Updates a lead by ID (Protected: Admin/Manager).
   */
  updateLead = asyncHandler(async (req, res) => {
    const lead = await leadService.updateLead(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(lead, 'Lead updated successfully')
    );
  });

  /**
   * PUT /api/v1/leads/:id/status
   * Updates lead status (Protected: Admin/Manager).
   */
  updateStatus = asyncHandler(async (req, res) => {
    const lead = await leadService.updateStatus(req.params.id, req.body.status);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(lead, 'Lead status updated successfully')
    );
  });

  /**
   * PUT /api/v1/leads/:id/assign
   * Assigns lead to an admin user (Protected: Admin/Manager).
   */
  assignLead = asyncHandler(async (req, res) => {
    const lead = await leadService.assignLead(req.params.id, req.body.assignedTo);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(lead, 'Lead assigned successfully')
    );
  });

  /**
   * POST /api/v1/leads/:id/notes
   * Adds an internal note to a lead (Protected: Admin/Manager).
   */
  addNote = asyncHandler(async (req, res) => {
    const lead = await leadService.addNote(req.params.id, req.body.content, req.user.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(lead, 'Note added to lead successfully')
    );
  });

  /**
   * DELETE /api/v1/leads/:id
   * Deletes a lead by ID (Protected: Admin/Manager).
   */
  deleteLead = asyncHandler(async (req, res) => {
    await leadService.deleteLead(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Lead deleted successfully')
    );
  });
}

export default new LeadController();
