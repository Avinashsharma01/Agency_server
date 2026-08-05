import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';

/**
 * Generates a JWT access token.
 *
 * @param {object} payload - Token payload (e.g., { id, email, role })
 * @returns {string} Signed JWT access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  });
};

/**
 * Generates a JWT refresh token.
 *
 * @param {object} payload - Token payload (e.g., { id })
 * @returns {string} Signed JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
};

/**
 * Verifies and decodes an access token.
 *
 * @param {string} token - JWT access token
 * @returns {object} Decoded token payload
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError}
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

/**
 * Verifies and decodes a refresh token.
 *
 * @param {string} token - JWT refresh token
 * @returns {object} Decoded token payload
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError}
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * Generates a cryptographically secure random token for password reset.
 *
 * @returns {{ token: string, hashedToken: string }} Raw token (for email) and hashed token (for DB)
 */
export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hashedToken };
};

/**
 * Hashes a raw reset token for database comparison.
 *
 * @param {string} token - Raw reset token
 * @returns {string} SHA-256 hashed token
 */
export const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Extracts the token from an Authorization header.
 *
 * @param {string} authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns {string|null} Token string or null if invalid format
 */
export const extractBearerToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

/**
 * Parses refresh token expiry string into milliseconds for cookie maxAge.
 *
 * @param {string} expiry - Expiry string (e.g., "7d", "24h", "30m")
 * @returns {number} Milliseconds
 */
export const parseExpiryToMs = (expiry) => {
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default: 7 days

  const [, value, unit] = match;
  return parseInt(value, 10) * units[unit];
};
