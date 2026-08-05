import BaseRepository from './base.repository.js';
import User from '../models/User.model.js';

/**
 * User Repository.
 * Extends BaseRepository with user-specific data access methods.
 * Handles password field selection, refresh token queries, and password reset lookups.
 */
class UserRepository extends BaseRepository {
  constructor() {
    super(User, ['name', 'email']);
  }

  /**
   * Finds a user by email (includes password field for auth).
   *
   * @param {string} email - User email
   * @returns {Promise<Document|null>} User document with password field
   */
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('role', 'name')
      .exec();
  }

  /**
   * Finds a user by email without the password field.
   *
   * @param {string} email - User email
   * @returns {Promise<Document|null>} User document without password
   */
  async findByEmailLean(email) {
    return User.findOne({ email: email.toLowerCase() })
      .populate('role', 'name')
      .lean()
      .exec();
  }

  /**
   * Finds a user by ID with role populated.
   *
   * @param {string} id - User ObjectId
   * @param {object} [options={}] - Additional options
   * @returns {Promise<Document|null>}
   */
  async findByIdWithRole(id, options = {}) {
    return this.findById(id, {
      populate: { path: 'role', select: 'name' },
      ...options,
    });
  }

  /**
   * Finds a user by refresh token.
   * Used during token refresh to validate the token owner.
   *
   * @param {string} refreshToken - The refresh token string
   * @returns {Promise<Document|null>} User document (Mongoose document, not lean)
   */
  async findByRefreshToken(refreshToken) {
    return User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() },
    })
      .select('+password')
      .populate('role', 'name')
      .exec();
  }

  /**
   * Finds a user by password reset token.
   * Only returns if the token hasn't expired.
   *
   * @param {string} hashedToken - SHA-256 hashed reset token
   * @returns {Promise<Document|null>} User document (Mongoose document for save())
   */
  async findByResetToken(hashedToken) {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    })
      .select('+password +passwordResetToken +passwordResetExpires')
      .exec();
  }

  /**
   * Checks if an email is already registered.
   *
   * @param {string} email - Email to check
   * @param {string} [excludeId] - User ID to exclude (for profile updates)
   * @returns {Promise<boolean>}
   */
  async isEmailTaken(email, excludeId = null) {
    const filter = { email: email.toLowerCase() };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return this.exists(filter);
  }

  /**
   * Gets paginated users with role populated.
   *
   * @param {object} reqQuery - Express req.query
   * @param {object} [baseFilter={}] - Additional filters
   * @returns {Promise<{ data: Document[], pagination: object }>}
   */
  async findPaginatedWithRole(reqQuery, baseFilter = {}) {
    return this.findPaginated(reqQuery, baseFilter, {
      populate: { path: 'role', select: 'name' },
    });
  }

  /**
   * Updates last login timestamp and increments login count.
   *
   * @param {string} userId - User ObjectId
   * @returns {Promise<Document|null>}
   */
  async updateLoginInfo(userId) {
    return User.findByIdAndUpdate(
      userId,
      {
        lastLoginAt: new Date(),
        $inc: { loginCount: 1 },
      },
      { new: true }
    )
      .populate('role', 'name')
      .lean()
      .exec();
  }
}

export default new UserRepository();
