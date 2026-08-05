import BaseRepository from './base.repository.js';
import Role from '../models/Role.model.js';

/**
 * Role Repository.
 * Extends BaseRepository with role-specific data access methods.
 */
class RoleRepository extends BaseRepository {
  constructor() {
    super(Role, ['name', 'description']);
  }

  /**
   * Finds a role by its name.
   *
   * @param {string} name - Role name (e.g., 'admin', 'manager', 'editor')
   * @returns {Promise<Document|null>}
   */
  async findByName(name) {
    return this.findOne({ name: name.toLowerCase() });
  }

  /**
   * Finds all active roles.
   *
   * @returns {Promise<Document[]>}
   */
  async findActiveRoles() {
    return this.findAll({ isActive: true }, { sort: { name: 1 } });
  }

  /**
   * Checks if a role name already exists.
   *
   * @param {string} name - Role name to check
   * @param {string} [excludeId] - Role ID to exclude (for updates)
   * @returns {Promise<boolean>}
   */
  async isNameTaken(name, excludeId = null) {
    const filter = { name: name.toLowerCase() };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return this.exists(filter);
  }
}

export default new RoleRepository();
