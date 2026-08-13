import BaseRepository from './base.repository.js';
import TeamMember from '../models/TeamMember.model.js';

/**
 * TeamMember Repository.
 * Data access layer for agency team members.
 */
class TeamMemberRepository extends BaseRepository {
  constructor() {
    super(TeamMember, ['name', 'designation', 'bio', 'email']);
  }

  /**
   * Finds all active team members sorted by order.
   *
   * @param {object} [options={}] - Query options
   * @returns {Promise<Document[]>}
   */
  async findActiveMembers(options = {}) {
    return this.findMany(
      { isActive: true, isDeleted: false },
      { sort: { order: 1, name: 1 }, ...options }
    );
  }
}

export default new TeamMemberRepository();
