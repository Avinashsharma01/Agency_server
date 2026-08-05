import ApiError from '../utils/ApiError.js';
import { verifyAccessToken, extractBearerToken } from '../helpers/token.helper.js';
import userRepository from '../repositories/user.repository.js';
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';
import logger from '../utils/logger.js';

/**
 * JWT authentication middleware.
 * Verifies the access token from the Authorization header,
 * validates the user still exists and is active,
 * and checks if the password was changed after the token was issued.
 *
 * On success, attaches `req.user` with { id, email, role } for downstream handlers.
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_MISSING);
    }

    // 2. Verify and decode the token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_EXPIRED);
      }
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.TOKEN_INVALID);
    }

    // 3. Verify the user still exists and is active
    const user = await userRepository.findByIdWithRole(decoded.id);

    if (!user) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        'The user associated with this token no longer exists'
      );
    }

    if (!user.isActive) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Your account has been deactivated. Contact an administrator.'
      );
    }

    // 4. Check if password was changed after the token was issued
    // We need the full Mongoose document for this method, so re-query without lean
    if (decoded.iat) {
      const fullUser = await userRepository.model.findById(decoded.id).select('passwordChangedAt');
      if (fullUser && fullUser.isPasswordChangedAfter(decoded.iat)) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Password was recently changed. Please log in again.'
        );
      }
    }

    // 5. Attach user info to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role?.name || null,
      roleId: user.role?._id?.toString() || null,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    logger.error(`Auth middleware error: ${error.message}`);
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED));
  }
};

export default authenticate;
