import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Global error handler middleware.
 * Catches all errors thrown in the request pipeline and returns a consistent JSON response.
 *
 * Handles:
 * - Custom ApiError instances
 * - Mongoose validation errors
 * - Mongoose cast errors (invalid ObjectId)
 * - Mongoose duplicate key errors
 * - JWT errors
 * - Multer errors
 * - Unknown/unexpected errors
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = {
    statusCode: err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
    stack: err.stack,
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = 'Validation failed';
    error.errors = messages;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = `Invalid ${err.path}: ${err.value}`;
    error.errors = [];
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.statusCode = HTTP_STATUS.CONFLICT;
    error.message = `Duplicate value for '${field}'. This value already exists.`;
    error.errors = [];
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.message = 'Invalid token';
    error.errors = [];
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.message = 'Token has expired';
    error.errors = [];
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = 'File size exceeds the maximum limit';
    error.errors = [];
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = 'Unexpected file field';
    error.errors = [];
  }

  // Log the error
  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} — ${error.message}`, {
      statusCode: error.statusCode,
      stack: error.stack,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: req.user?.id,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} — ${error.statusCode} ${error.message}`);
  }

  // Build response
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
  };

  if (error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;
