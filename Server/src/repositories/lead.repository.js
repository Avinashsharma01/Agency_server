import BaseRepository from './base.repository.js';
import Lead from '../models/Lead.model.js';

/**
 * Lead Repository.
 * Data access layer for contact inquiries and lead management.
 */
class LeadRepository extends BaseRepository {
  constructor() {
    super(Lead, ['name', 'email', 'company', 'subject', 'message']);
  }

  /**
   * Adds an internal note to a lead.
   *
   * @param {string} leadId - Lead ObjectId
   * @param {object} noteData - { content, addedBy }
   * @returns {Promise<Document|null>}
   */
  async addNote(leadId, noteData) {
    return this.model
      .findByIdAndUpdate(
        leadId,
        { $push: { notes: noteData } },
        { new: true, runValidators: true }
      )
      .populate('notes.addedBy', 'name email avatar')
      .exec();
  }

  /**
   * Updates a lead's status.
   *
   * @param {string} leadId - Lead ObjectId
   * @param {string} status - New status
   * @returns {Promise<Document|null>}
   */
  async updateStatus(leadId, status) {
    return this.updateById(leadId, { status });
  }

  /**
   * Soft deletes a lead.
   *
   * @param {string} leadId - Lead ObjectId
   * @returns {Promise<Document|null>}
   */
  async softDelete(leadId) {
    return this.softDeleteById(leadId);
  }
}

export default new LeadRepository();
