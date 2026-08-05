import authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';

/**
 * Auth Controller.
 * Handles HTTP request/response for authentication endpoints.
 */
class AuthController {
  /**
   * POST /api/v1/auth/login
   * Authenticates a user and returns tokens.
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const meta = {
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.connection.remoteAddress || '',
    };

    const { user, accessToken, refreshToken } = await authService.login(
      { email, password },
      meta
    );

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, authService.getRefreshTokenCookieOptions());

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(
        { user, accessToken },
        MESSAGES.AUTH.LOGIN_SUCCESS
      )
    );
  });

  /**
   * POST /api/v1/auth/logout
   * Logs out the current session by invalidating the refresh token.
   */
  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.signedCookies?.refreshToken || req.body.refreshToken;

    await authService.logout(refreshToken);

    // Clear the cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, MESSAGES.AUTH.LOGOUT_SUCCESS)
    );
  });

  /**
   * POST /api/v1/auth/logout-all
   * Logs out from all devices by clearing all refresh tokens.
   */
  logoutAll = asyncHandler(async (req, res) => {
    await authService.logoutAll(req.user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Logged out from all devices successfully')
    );
  });

  /**
   * POST /api/v1/auth/refresh-token
   * Refreshes the access token using the refresh token cookie.
   */
  refreshToken = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.signedCookies?.refreshToken || req.body.refreshToken;

    const meta = {
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.connection.remoteAddress || '',
    };

    const { accessToken, refreshToken } = await authService.refreshToken(
      oldRefreshToken,
      meta
    );

    // Set new refresh token cookie
    res.cookie('refreshToken', refreshToken, authService.getRefreshTokenCookieOptions());

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(
        { accessToken },
        MESSAGES.AUTH.TOKEN_REFRESHED
      )
    );
  });

  /**
   * POST /api/v1/auth/forgot-password
   * Sends a password reset email.
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    // Always return success (don't reveal if email exists)
    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, MESSAGES.PASSWORD.RESET_EMAIL_SENT)
    );
  });

  /**
   * POST /api/v1/auth/reset-password/:token
   * Resets the password using a valid reset token.
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    await authService.resetPassword(token, password);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, MESSAGES.PASSWORD.RESET_SUCCESS)
    );
  });

  /**
   * PUT /api/v1/auth/change-password
   * Changes the authenticated user's password.
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    // Clear the refresh token cookie (force re-login)
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, MESSAGES.PASSWORD.CHANGED)
    );
  });
}

export default new AuthController();
