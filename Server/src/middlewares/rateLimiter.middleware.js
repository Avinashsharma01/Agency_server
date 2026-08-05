import rateLimit from 'express-rate-limit';
import config from '../config/index.js';
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';

/**
 * General API rate limiter.
 * Limits each IP to a configurable number of requests per window.
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: MESSAGES.RATE_LIMIT,
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

/**
 * Strict rate limiter for authentication endpoints.
 * 10 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});

/**
 * Rate limiter for password reset requests.
 * 5 attempts per hour per IP.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many password reset attempts. Please try again after 1 hour.',
  },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
});
