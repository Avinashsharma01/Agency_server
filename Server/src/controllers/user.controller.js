import userService from '../services/user.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';

/**
 * User Controller.
 * Handles HTTP request/response for user management endpoints.
 */
class UserController {
  /**
   * POST /api/v1/users
   * Creates a new user (admin only).
   */
  createUser = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(user, MESSAGES.USER.CREATED)
    );
  });

  /**
   * GET /api/v1/users
   * Gets all users with pagination (admin only).
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const { data, pagination } = await userService.getAllUsers(req.query);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, MESSAGES.LIST_FETCHED)
    );
  });

  /**
   * GET /api/v1/users/:id
   * Gets a user by ID (admin only).
   */
  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(user, MESSAGES.FETCHED)
    );
  });

  /**
   * PUT /api/v1/users/:id
   * Updates a user by ID (admin only).
   */
  updateUser = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(user, MESSAGES.USER.UPDATED)
    );
  });

  /**
   * DELETE /api/v1/users/:id
   * Deletes a user by ID (admin only).
   */
  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id, req.user.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, MESSAGES.USER.DELETED)
    );
  });

  /**
   * GET /api/v1/users/profile/me
   * Gets the authenticated user's profile.
   */
  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(user, MESSAGES.USER.PROFILE_FETCHED)
    );
  });

  /**
   * PUT /api/v1/users/profile/me
   * Updates the authenticated user's profile.
   */
  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(user, MESSAGES.USER.PROFILE_UPDATED)
    );
  });

  /**
   * PUT /api/v1/users/profile/avatar
   * Updates the authenticated user's avatar.
   */
  updateAvatar = asyncHandler(async (req, res) => {
    const user = await userService.updateAvatar(req.user.id, req.file);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(user, 'Avatar updated successfully')
    );
  });
}

export default new UserController();
