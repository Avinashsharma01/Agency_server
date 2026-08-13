import userRepository from '../repositories/user.repository.js';
import roleRepository from '../repositories/role.repository.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';
import { deleteFromCloudinary, uploadToCloudinary } from '../helpers/cloudinary.helper.js';
import { sendWelcomeEmail } from '../helpers/email.helper.js';
import { CLOUDINARY_FOLDERS } from '../constants/index.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import fs from 'fs/promises';

/**
 * User Service.
 * Handles user CRUD operations for admin management.
 */
class UserService {
  /**
   * Creates a new user.
   *
   * @param {object} userData - { name, email, password, role, isActive }
   * @returns {Promise<object>} Created user
   */
  async createUser(userData) {
    // Check if email is already taken
    const emailExists = await userRepository.isEmailTaken(userData.email);
    if (emailExists) {
      throw new ApiError(HTTP_STATUS.CONFLICT, MESSAGES.USER.EMAIL_EXISTS);
    }

    // Resolve role name to role document
    const role = await roleRepository.findByName(userData.role);
    if (!role) {
      throw ApiError.badRequest(`Invalid role '${userData.role}'. Valid roles: admin, manager, editor.`);
    }

    // Replace role name with role ObjectId
    userData.role = role._id;

    // Create user
    const user = await userRepository.create(userData);

    // Fetch with role populated
    const populatedUser = await userRepository.findByIdWithRole(user._id);

    // Send welcome email (non-blocking — don't fail if email fails)
    try {
      const loginUrl = `${config.frontend.url}/login`;
      await sendWelcomeEmail(userData.email, userData.name, loginUrl);
    } catch (error) {
      logger.warn(`Failed to send welcome email to ${userData.email}: ${error.message}`);
    }

    return populatedUser;
  }

  /**
   * Gets all users with pagination.
   *
   * @param {object} query - Express req.query
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getAllUsers(query) {
    return userRepository.findPaginatedWithRole(query);
  }

  /**
   * Gets a user by ID.
   *
   * @param {string} userId - User ObjectId
   * @returns {Promise<object>} User data
   */
  async getUserById(userId) {
    const user = await userRepository.findByIdWithRole(userId);

    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    return user;
  }

  /**
   * Updates a user by ID (admin operation).
   *
   * @param {string} userId - User ObjectId
   * @param {object} updateData - Fields to update
   * @returns {Promise<object>} Updated user
   */
  async updateUser(userId, updateData) {
    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    // Check email uniqueness if email is being changed
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailTaken = await userRepository.isEmailTaken(updateData.email, userId);
      if (emailTaken) {
        throw new ApiError(HTTP_STATUS.CONFLICT, MESSAGES.USER.EMAIL_EXISTS);
      }
    }

    // Resolve role name if being changed
    if (updateData.role) {
      const role = await roleRepository.findByName(updateData.role);
      if (!role) {
        throw ApiError.badRequest(`Invalid role '${updateData.role}'. Valid roles: admin, manager, editor.`);
      }
      updateData.role = role._id;
    }

    const updatedUser = await userRepository.updateById(userId, updateData, {
      populate: { path: 'role', select: 'name' },
    });

    return updatedUser;
  }

  /**
   * Deletes a user by ID.
   *
   * @param {string} userId - User ObjectId
   * @param {string} requesterId - ID of the user making the request
   * @returns {Promise<object>} Deleted user
   */
  async deleteUser(userId, requesterId) {
    // Prevent self-deletion
    if (userId === requesterId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    // Delete avatar from Cloudinary if exists
    if (user.avatar?.publicId) {
      try {
        await deleteFromCloudinary(user.avatar.publicId);
      } catch (error) {
        logger.warn(`Failed to delete avatar for user ${userId}: ${error.message}`);
      }
    }

    await userRepository.deleteById(userId);

    return user;
  }

  /**
   * Gets the authenticated user's profile.
   *
   * @param {string} userId - User ObjectId
   * @returns {Promise<object>} User profile data
   */
  async getProfile(userId) {
    const user = await userRepository.findByIdWithRole(userId);

    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    return user;
  }

  /**
   * Updates the authenticated user's own profile.
   *
   * @param {string} userId - User ObjectId
   * @param {object} updateData - { name, email }
   * @returns {Promise<object>} Updated profile
   */
  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    // Check email uniqueness if changing
    if (updateData.email && updateData.email !== user.email) {
      const emailTaken = await userRepository.isEmailTaken(updateData.email, userId);
      if (emailTaken) {
        throw new ApiError(HTTP_STATUS.CONFLICT, MESSAGES.USER.EMAIL_EXISTS);
      }
    }

    const updatedUser = await userRepository.updateById(userId, updateData, {
      populate: { path: 'role', select: 'name' },
    });

    return updatedUser;
  }

  /**
   * Updates the user's avatar.
   *
   * @param {string} userId - User ObjectId
   * @param {object} file - Multer file object
   * @returns {Promise<object>} Updated user with new avatar
   */
  async updateAvatar(userId, file) {
    if (!file) {
      throw ApiError.badRequest('Avatar image is required');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar?.publicId) {
      try {
        await deleteFromCloudinary(user.avatar.publicId);
      } catch (error) {
        logger.warn(`Failed to delete old avatar: ${error.message}`);
      }
    }

    // Upload new avatar
    const result = await uploadToCloudinary(file.path, CLOUDINARY_FOLDERS.USERS, {
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    // Clean up temp file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      logger.warn(`Failed to delete temp file: ${file.path}`);
    }

    // Update user avatar
    const updatedUser = await userRepository.updateById(userId, {
      avatar: {
        publicId: result.publicId,
        url: result.secureUrl,
      },
    }, {
      populate: { path: 'role', select: 'name' },
    });

    return updatedUser;
  }
}

export default new UserService();
