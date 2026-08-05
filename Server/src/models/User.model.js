import mongoose from 'mongoose';
import { hashPassword } from '../helpers/password.helper.js';
import { MAX_REFRESH_TOKENS, PASSWORD_RESET_EXPIRY_MS } from '../constants/index.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never include in queries by default
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role is required'],
    },
    avatar: {
      publicId: { type: String, default: null },
      url: { type: String, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ─── Refresh Token Rotation ───────────────────────────────────────
    // Stores up to MAX_REFRESH_TOKENS active refresh tokens per user.
    // Enables multi-device login while limiting token sprawl.
    refreshTokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        userAgent: { type: String, default: '' },
        ip: { type: String, default: '' },
      },
    ],

    // ─── Password Reset ──────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },

    // ─── Login Tracking ──────────────────────────────────────────────
    lastLoginAt: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// email index is auto-created by `unique: true` in the schema definition
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ 'refreshTokens.token': 1 });

// ─── Pre-save Hook: Hash Password ──────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if the password field has been modified
  if (!this.isModified('password')) return next();

  this.password = await hashPassword(this.password);

  // Track password change timestamp (skip on first creation)
  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }

  next();
});

// ─── Instance Methods ───────────────────────────────────────────────────────

/**
 * Checks if the password was changed after a given JWT was issued.
 * Used to invalidate JWTs issued before a password change.
 *
 * @param {number} jwtTimestamp - JWT iat (issued at) timestamp in seconds
 * @returns {boolean} True if password was changed after the token was issued
 */
userSchema.methods.isPasswordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

/**
 * Adds a refresh token to the user's token array.
 * Enforces MAX_REFRESH_TOKENS limit by removing the oldest token.
 *
 * @param {string} token - Hashed refresh token
 * @param {Date} expiresAt - Token expiry date
 * @param {string} userAgent - Request user agent
 * @param {string} ip - Request IP address
 */
userSchema.methods.addRefreshToken = function (token, expiresAt, userAgent = '', ip = '') {
  // Remove expired tokens first
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.expiresAt > new Date()
  );

  // Enforce max token limit (FIFO: remove oldest)
  if (this.refreshTokens.length >= MAX_REFRESH_TOKENS) {
    this.refreshTokens.shift();
  }

  this.refreshTokens.push({ token, expiresAt, userAgent, ip });
};

/**
 * Removes a specific refresh token from the array.
 *
 * @param {string} token - The refresh token to remove
 */
userSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.token !== token);
};

/**
 * Removes all refresh tokens (logout from all devices).
 */
userSchema.methods.removeAllRefreshTokens = function () {
  this.refreshTokens = [];
};

/**
 * Sets the password reset token and expiry.
 *
 * @param {string} hashedToken - SHA-256 hashed reset token
 */
userSchema.methods.setPasswordResetToken = function (hashedToken) {
  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
};

/**
 * Clears the password reset token and expiry.
 */
userSchema.methods.clearPasswordResetToken = function () {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

const User = mongoose.model('User', userSchema);

export default User;
