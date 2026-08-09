import userRepository from '../repositories/user.repository.js';
import roleRepository from '../repositories/role.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetToken,
  hashResetToken,
  parseExpiryToMs,
} from '../helpers/token.helper.js';
import { comparePassword } from '../helpers/password.helper.js';
import { sendPasswordResetEmail } from '../helpers/email.helper.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES, HTTP_STATUS, ROLES } from '../constants/index.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Authentication Service.
 * Handles login, logout, token refresh, and password management flows.
 */
class AuthService {
  /**
   * Authenticates a user with email and password.
   * Returns access token, refresh token, and user data.
   *
   * @param {object} credentials - { email, password }
   * @param {object} meta - { userAgent, ip } for refresh token tracking
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   */
  async login({ email, password }, meta = {}) {
    // 1. Find user by email (includes password field)
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // 2. Check if user is active
    if (!user.isActive) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Your account has been deactivated. Contact an administrator.'
      );
    }

    // 3. Compare passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // 4. Generate tokens
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role?.name || null,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ id: user._id.toString() });

    // 5. Store refresh token in user document
    const refreshExpiry = new Date(
      Date.now() + parseExpiryToMs(config.jwt.refreshExpiry)
    );

    user.addRefreshToken(
      refreshToken,
      refreshExpiry,
      meta.userAgent || '',
      meta.ip || ''
    );
    await user.save({ validateBeforeSave: false });

    // 6. Update login tracking
    await userRepository.updateLoginInfo(user._id);

    // 7. Build sanitized user response
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
    };

    logger.info(`User logged in: ${user.email}`);

    return { user: userData, accessToken, refreshToken };
  }

  /**
   * Logs out a user by removing their refresh token.
   *
   * @param {string} refreshToken - The refresh token to invalidate
   */
  async logout(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, MESSAGES.AUTH.REFRESH_TOKEN_MISSING);
    }

    const user = await userRepository.findByRefreshToken(refreshToken);

    if (user) {
      user.removeRefreshToken(refreshToken);
      await user.save({ validateBeforeSave: false });
      logger.info(`User logged out: ${user.email}`);
    }
  }

  /**
   * Logs out from all devices by clearing all refresh tokens.
   *
   * @param {string} userId - User ID
   */
  async logoutAll(userId) {
    const user = await userRepository.model.findById(userId);

    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    user.removeAllRefreshTokens();
    await user.save({ validateBeforeSave: false });
    logger.info(`User logged out from all devices: ${user.email}`);
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * Implements token rotation: old refresh token is replaced with a new one.
   *
   * @param {string} oldRefreshToken - Current refresh token
   * @param {object} meta - { userAgent, ip }
   * @returns {Promise<{ accessToken: string, refreshToken: string }>}
   */
  async refreshToken(oldRefreshToken, meta = {}) {
    if (!oldRefreshToken) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.REFRESH_TOKEN_MISSING);
    }

    // 1. Verify the refresh token JWT signature
    let decoded;
    try {
      decoded = verifyRefreshToken(oldRefreshToken);
    } catch (err) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.REFRESH_TOKEN_INVALID);
    }

    // 2. Find user who owns this refresh token
    const user = await userRepository.findByRefreshToken(oldRefreshToken);

    if (!user) {
      // Token reuse detected — possible theft. Invalidate all tokens.
      logger.warn(`Refresh token reuse detected for user ID: ${decoded.id}`);
      const targetUser = await userRepository.model.findById(decoded.id);
      if (targetUser) {
        targetUser.removeAllRefreshTokens();
        await targetUser.save({ validateBeforeSave: false });
      }
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.REFRESH_TOKEN_INVALID);
    }

    // 3. Check if user is still active
    if (!user.isActive) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Your account has been deactivated.'
      );
    }

    // 4. Rotate: remove old token, issue new pair
    user.removeRefreshToken(oldRefreshToken);

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role?.name || null,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken({ id: user._id.toString() });

    const refreshExpiry = new Date(
      Date.now() + parseExpiryToMs(config.jwt.refreshExpiry)
    );

    user.addRefreshToken(
      newRefreshToken,
      refreshExpiry,
      meta.userAgent || '',
      meta.ip || ''
    );

    await user.save({ validateBeforeSave: false });

    logger.info(`Token refreshed for user: ${user.email}`);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Initiates the password reset flow.
   * Generates a reset token, stores the hash in the DB, and sends the email.
   *
   * @param {string} email - User email
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal whether the email exists (security best practice)
      return;
    }

    // Generate reset token
    const { token, hashedToken } = generateResetToken();

    // Store hashed token and expiry in user document
    user.setPasswordResetToken(hashedToken);
    await user.save({ validateBeforeSave: false });

    // Build reset URL
    const resetUrl = `${config.frontend.url}/reset-password/${token}`;

    // Send email (don't throw on email failure — log and return)
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      logger.info(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      // Roll back the token if email fails
      user.clearPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      logger.error(`Failed to send password reset email to ${user.email}: ${error.message}`);
      throw ApiError.internal('Failed to send password reset email. Please try again later.');
    }
  }

  /**
   * Resets the user's password using a valid reset token.
   *
   * @param {string} token - Raw reset token from the email link
   * @param {string} newPassword - New password
   */
  async resetPassword(token, newPassword) {
    // Hash the token to compare with DB
    const hashedToken = hashResetToken(token);

    // Find user with valid reset token
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, MESSAGES.PASSWORD.RESET_TOKEN_INVALID);
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.clearPasswordResetToken();

    // Invalidate all refresh tokens (force re-login)
    user.removeAllRefreshTokens();

    await user.save();

    logger.info(`Password reset completed for: ${user.email}`);
  }

  /**
   * Changes the user's password (requires current password).
   *
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.model
      .findById(userId)
      .select('+password')
      .exec();

    if (!user) {
      throw ApiError.notFound(MESSAGES.USER.NOT_FOUND);
    }

    // Verify current password
    const isCurrentValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentValid) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, MESSAGES.PASSWORD.CURRENT_INCORRECT);
    }

    // Update password (pre-save hook handles hashing)
    user.password = newPassword;

    // Invalidate all refresh tokens (force re-login on all devices)
    user.removeAllRefreshTokens();

    await user.save();

    logger.info(`Password changed for user: ${user.email}`);
  }

  /**
   * Registers a new admin user.
   * Auto-creates the 'admin' role if it does not exist.
   * Returns access token, refresh token, and user data (same shape as login).
   *
   * @param {object} data - { name, email, password }
   * @param {object} meta - { userAgent, ip } for refresh token tracking
   * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
   */
  async registerAdmin({ name, email, password }, meta = {}) {
    // 1. Check if email is already taken
    const existingUser = await userRepository.findByEmailLean(email);
    if (existingUser) {
      throw ApiError.conflict(MESSAGES.USER.EMAIL_EXISTS);
    }

    // 2. Get (or auto-create) the admin role
    let adminRole = await roleRepository.findByName(ROLES.ADMIN);
    if (!adminRole) {
      adminRole = await roleRepository.model.create({
        name: ROLES.ADMIN,
        description: 'Full system access. Can manage all resources, users, and settings.',
        isActive: true,
      });
      logger.info('Admin role auto-created during registration');
    }

    // 3. Create user (password hashing is handled by the pre-save hook)
    const user = await userRepository.model.create({
      name,
      email,
      password,
      role: adminRole._id,
      isActive: true,
    });

    // 4. Generate tokens
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: ROLES.ADMIN,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ id: user._id.toString() });

    // 5. Store refresh token
    const refreshExpiry = new Date(
      Date.now() + parseExpiryToMs(config.jwt.refreshExpiry)
    );

    user.addRefreshToken(
      refreshToken,
      refreshExpiry,
      meta.userAgent || '',
      meta.ip || ''
    );
    await user.save({ validateBeforeSave: false });

    // 6. Update login tracking
    await userRepository.updateLoginInfo(user._id);

    // 7. Build sanitized user response
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: { _id: adminRole._id, name: adminRole.name },
      avatar: user.avatar,
      isActive: user.isActive,
    };

    logger.info(`Admin registered: ${user.email}`);

    return { user: userData, accessToken, refreshToken };
  }

  /**
   * Gets cookie options for the refresh token.
   *
   * @returns {object} Cookie configuration object
   */
  getRefreshTokenCookieOptions() {
    return {
      httpOnly: true,
      secure: config.app.isProduction,
      sameSite: config.app.isProduction ? 'strict' : 'lax',
      maxAge: parseExpiryToMs(config.jwt.refreshExpiry),
      path: '/',
      signed: true,
    };
  }
}

export default new AuthService();
