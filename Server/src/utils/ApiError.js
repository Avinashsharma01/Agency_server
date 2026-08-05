/**
 * Custom API Error class.
 * Extends the native Error class with HTTP status codes and operational flags.
 *
 * @example
 * throw new ApiError(404, 'User not found');
 * throw new ApiError(400, 'Validation failed', ['Name is required', 'Email is invalid']);
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {string[]} [errors=[]] - Array of specific error details
   * @param {boolean} [isOperational=true] - Whether this is an expected operational error
   */
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.success = false;

    // Capture stack trace, excluding the constructor
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Factory: 400 Bad Request
   */
  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * Factory: 401 Unauthorized
   */
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  /**
   * Factory: 403 Forbidden
   */
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  /**
   * Factory: 404 Not Found
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /**
   * Factory: 409 Conflict
   */
  static conflict(message, errors = []) {
    return new ApiError(409, message, errors);
  }

  /**
   * Factory: 422 Unprocessable Entity
   */
  static unprocessable(message, errors = []) {
    return new ApiError(422, message, errors);
  }

  /**
   * Factory: 429 Too Many Requests
   */
  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  /**
   * Factory: 500 Internal Server Error
   */
  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], false);
  }
}

export default ApiError;
