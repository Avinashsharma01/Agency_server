import teamMemberRepository from '../repositories/teamMember.repository.js';
import ApiError from '../utils/ApiError.js';

/**
 * TeamMember Service.
 * Business logic for agency staff & team profiles.
 */
class TeamMemberService {
  /**
   * Creates a new TeamMember.
   *
   * @param {object} memberData - Payload
   * @returns {Promise<object>} Created team member document
   */
  async createMember(memberData) {
    return teamMemberRepository.create(memberData);
  }

  /**
   * Gets paginated list of team members.
   *
   * @param {object} queryParams - Express req.query
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getMembers(queryParams) {
    const extraFilter = {};

    if (queryParams.isActive !== undefined) {
      extraFilter.isActive = queryParams.isActive === 'true' || queryParams.isActive === true;
    }

    return teamMemberRepository.findPaginated(queryParams, extraFilter);
  }

  /**
   * Gets all active team members (unpaginated, sorted by order).
   *
   * @returns {Promise<object[]>}
   */
  async getActiveMembers() {
    return teamMemberRepository.findActiveMembers();
  }

  /**
   * Gets team member by ID.
   *
   * @param {string} memberId - TeamMember ObjectId
   * @returns {Promise<object>}
   */
  async getMemberById(memberId) {
    const member = await teamMemberRepository.findById(memberId);

    if (!member || member.isDeleted) {
      throw ApiError.notFound('Team member not found');
    }

    return member;
  }

  /**
   * Updates a team member by ID.
   *
   * @param {string} memberId - TeamMember ObjectId
   * @param {object} updateData - Fields to update
   * @returns {Promise<object>}
   */
  async updateMember(memberId, updateData) {
    const existing = await teamMemberRepository.findById(memberId);
    if (!existing || existing.isDeleted) {
      throw ApiError.notFound('Team member not found');
    }

    return teamMemberRepository.updateById(memberId, updateData);
  }

  /**
   * Soft deletes a team member.
   *
   * @param {string} memberId - TeamMember ObjectId
   * @returns {Promise<object>}
   */
  async deleteMember(memberId) {
    const member = await teamMemberRepository.findById(memberId);
    if (!member || member.isDeleted) {
      throw ApiError.notFound('Team member not found');
    }

    return teamMemberRepository.softDeleteById(memberId);
  }
}

export default new TeamMemberService();
