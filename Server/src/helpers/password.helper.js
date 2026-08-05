import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param {string} password - Plain-text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plain-text password with a bcrypt hash.
 *
 * @param {string} password - Plain-text password to check
 * @param {string} hashedPassword - Stored bcrypt hash
 * @returns {Promise<boolean>} True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};
