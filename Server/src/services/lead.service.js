import leadRepository from '../repositories/lead.repository.js';
import serviceRepository from '../repositories/service.repository.js';
import userRepository from '../repositories/user.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * Lead Service.
 * Handles public contact form inquiries, status pipeline tracking, notes, and staff assignment.
 */
class LeadService {
  /**
   * Creates a new Lead (public form submission).
   *
   * @param {object} leadData - Form data payload
   * @param {object} [clientMetadata={}] - { ip, userAgent }
   * @returns {Promise<object>} Created lead document
   */
  async createLead(leadData, clientMetadata = {}) {
    // Verify service if specified
    if (leadData.service) {
      const service = await serviceRepository.findById(leadData.service);
      if (!service || service.isDeleted) {
        throw ApiError.badRequest('Referenced service does not exist');
      }
    }

    if (clientMetadata.ip) leadData.ip = clientMetadata.ip;
    if (clientMetadata.userAgent) leadData.userAgent = clientMetadata.userAgent;

    const createdLead = await leadRepository.create(leadData);

    return leadRepository.findById(createdLead._id, {
      populate: [
        { path: 'service', select: 'title slug' },
        { path: 'assignedTo', select: 'name email avatar' },
      ],
    });
  }

  /**
   * Gets paginated leads list (Admin/Manager).
   *
   * @param {object} queryParams - Express req.query
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getLeads(queryParams) {
    const extraFilter = {};

    if (queryParams.status) {
      extraFilter.status = queryParams.status;
    }

    if (queryParams.service) {
      extraFilter.service = queryParams.service;
    }

    if (queryParams.assignedTo) {
      extraFilter.assignedTo = queryParams.assignedTo;
    }

    return leadRepository.findPaginated(queryParams, extraFilter, {
      populate: [
        { path: 'service', select: 'title slug' },
        { path: 'assignedTo', select: 'name email avatar' },
      ],
    });
  }

  /**
   * Gets a lead by ID.
   *
   * @param {string} leadId - Lead ObjectId
   * @returns {Promise<object>}
   */
  async getLeadById(leadId) {
    const lead = await leadRepository.findById(leadId, {
      populate: [
        { path: 'service', select: 'title slug' },
        { path: 'assignedTo', select: 'name email avatar' },
        { path: 'notes.addedBy', select: 'name email avatar' },
      ],
    });

    if (!lead || lead.isDeleted) {
      throw ApiError.notFound('Lead not found');
    }

    return lead;
  }

  /**
   * Updates a lead (general update).
   *
   * @param {string} leadId - Lead ObjectId
   * @param {object} updateData - Update payload
   * @returns {Promise<object>} Updated lead document
   */
  async updateLead(leadId, updateData) {
    const lead = await leadRepository.findById(leadId);
    if (!lead || lead.isDeleted) {
      throw ApiError.notFound('Lead not found');
    }

    if (updateData.service) {
      const service = await serviceRepository.findById(updateData.service);
      if (!service || service.isDeleted) {
        throw ApiError.badRequest('Referenced service does not exist');
      }
    }

    if (updateData.assignedTo) {
      const user = await userRepository.findById(updateData.assignedTo);
      if (!user) {
        throw ApiError.badRequest('Assigned user does not exist');
      }
    }

    return leadRepository.updateById(leadId, updateData, {
      populate: [
        { path: 'service', select: 'title slug' },
        { path: 'assignedTo', select: 'name email avatar' },
      ],
    });
  }

  /**
   * Updates lead status.
   *
   * @param {string} leadId - Lead ObjectId
   * @param {string} status - New pipeline status
   * @returns {Promise<object>}
   */
  async updateStatus(leadId, status) {
    const lead = await leadRepository.findById(leadId);
    if (!lead || lead.isDeleted) {
      throw ApiError.notFound('Lead not found');
    }

    return leadRepository.updateStatus(leadId, status);
  }

  /**
   * Assigns a lead to an admin user.
   *
   * @param {string} leadId - Lead ObjectId
   * @param {string} userId - User ObjectId
   * @returns {Promise<object>}
   */
  async assignLead(leadId, userId) {
    const lead = await leadRepository.findById(leadId);
    if (!lead || lead.isDeleted) {
      throw ApiError.notFound('Lead not found');
    }

    if (userId) {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw ApiError.badRequest('Assigned user does not exist');
      }
    }

    return leadRepository.updateById(leadId, { assignedTo: userId }, {
      populate: [
        { path: 'service', select: 'title slug' },
        { path: 'assignedTo', select: 'name email avatar' },
      ],
    });
  }

  /**
   * Adds an internal note to a lead.
   *
   * @param {string} leadId - Lead ObjectId
   * @param {string} content - Note text
   * @param {string} userId - User ObjectId (author of note)
   * @returns {Promise<object>} Updated lead with notes
   */
  async addNote(leadId, content, userId) {
    const lead = await leadRepository.findById(leadId);
    if (!lead || lead.isDeleted) {
      throw ApiError.notFound('Lead not found');
    }

    return leadRepository.addNote(leadId, {
      content,
      addedBy: userId,
      createdAt: new Date(),
    });
  }

  /**
   * Soft deletes a lead.
   *
   * @param {string} leadId - Lead ObjectId
   * @returns {Promise<object>}
   */
  async deleteLead(leadId) {
    const lead = await leadRepository.findById(leadId);
    if (!lead || lead.isDeleted) {
      throw ApiError.notFound('Lead not found');
    }

    return leadRepository.softDeleteById(leadId);
  }
}

export default new LeadService();
