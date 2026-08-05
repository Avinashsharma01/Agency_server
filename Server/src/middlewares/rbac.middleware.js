import ApiError from '../utils/ApiError.js';
import { MESSAGES, HTTP_STATUS, ROLE_HIERARCHY } from '../constants/index.js';

/**
 * Role-Based Access Control (RBAC) middleware factory.
 *
 * Checks if the authenticated user's role is included in the allowed roles.
 * Must be used AFTER the `authenticate` middleware.
 *
 * @param {...string} allowedRoles - Role names that are permitted (e.g., 'admin', 'manager')
 * @returns {Function} Express middleware
 *
 * @example
 * // Only admin can access
 * router.delete('/users/:id', authenticate, authorize('admin'), controller.delete);
 *
 * // Admin and manager can access
 * router.post('/services', authenticate, authorize('admin', 'manager'), controller.create);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure authenticate middleware has run
    if (!req.user || !req.user.role) {
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED)
      );
    }

    const userRole = req.user.role;

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `${MESSAGES.AUTH.FORBIDDEN}. Required: ${allowedRoles.join(' or ')}. Your role: ${userRole}.`
        )
      );
    }

    next();
  };
};

/**
 * Middleware that allows access if the user's role is at or above a minimum level.
 * Uses the ROLE_HIERARCHY for comparison.
 *
 * @param {string} minRole - Minimum required role (e.g., 'manager')
 * @returns {Function} Express middleware
 *
 * @example
 * // Manager and above (manager, admin) can access
 * router.put('/leads/:id', authenticate, authorizeMinRole('manager'), controller.update);
 */
export const authorizeMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED)
      );
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userRoleLevel < minRoleLevel) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `${MESSAGES.AUTH.FORBIDDEN}. Minimum role required: ${minRole}. Your role: ${req.user.role}.`
        )
      );
    }

    next();
  };
};

/**
 * Middleware that allows access if the user is the resource owner OR has a specified role.
 * Useful for routes where users can manage their own resources.
 *
 * @param {string} ownerIdParam - Request param name containing the owner's ID (default: 'id')
 * @param {...string} allowedRoles - Additional roles that can access regardless of ownership
 * @returns {Function} Express middleware
 *
 * @example
 * // User can update own profile, or admin can update anyone
 * router.put('/users/:id', authenticate, authorizeOwnerOrRole('id', 'admin'), controller.update);
 */
export const authorizeOwnerOrRole = (ownerIdParam = 'id', ...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(HTTP_STATUS.UNAUTHORIZED, MESSAGES.AUTH.UNAUTHORIZED)
      );
    }

    const resourceOwnerId = req.params[ownerIdParam];
    const isOwner = req.user.id === resourceOwnerId;
    const hasRole = allowedRoles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      return next(
        new ApiError(HTTP_STATUS.FORBIDDEN, MESSAGES.AUTH.FORBIDDEN)
      );
    }

    next();
  };
};

export default authorize;
