/**
 * User-facing message strings.
 * Centralizes all response messages to ensure consistency and ease of localization.
 */
const MESSAGES = Object.freeze({
  // General
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  FETCHED: 'Resource fetched successfully',
  LIST_FETCHED: 'Resources fetched successfully',
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  INVALID_ID: 'Invalid resource ID',

  // Authentication
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Authentication required. Please log in.',
    FORBIDDEN: 'You do not have permission to perform this action',
    TOKEN_EXPIRED: 'Token has expired. Please log in again.',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_MISSING: 'Access token is missing',
    REFRESH_TOKEN_MISSING: 'Refresh token is missing',
    REFRESH_TOKEN_INVALID: 'Invalid or expired refresh token',
  },

  // Password
  PASSWORD: {
    CHANGED: 'Password changed successfully',
    RESET_EMAIL_SENT: 'Password reset email sent. Check your inbox.',
    RESET_SUCCESS: 'Password reset successful',
    RESET_TOKEN_INVALID: 'Invalid or expired password reset token',
    CURRENT_INCORRECT: 'Current password is incorrect',
    SAME_AS_OLD: 'New password must be different from the current password',
  },

  // User
  USER: {
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
    NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'A user with this email already exists',
    PROFILE_FETCHED: 'Profile fetched successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
  },

  // Category
  CATEGORY: {
    CREATED: 'Category created successfully',
    UPDATED: 'Category updated successfully',
    DELETED: 'Category deleted successfully',
    NOT_FOUND: 'Category not found',
    SLUG_EXISTS: 'A category with this slug already exists',
    HAS_SERVICES: 'Cannot delete category with associated services',
  },

  // Service
  SERVICE: {
    CREATED: 'Service created successfully',
    UPDATED: 'Service updated successfully',
    DELETED: 'Service deleted successfully',
    NOT_FOUND: 'Service not found',
    SLUG_EXISTS: 'A service with this slug already exists',
  },

  // Package
  PACKAGE: {
    CREATED: 'Package created successfully',
    UPDATED: 'Package updated successfully',
    DELETED: 'Package deleted successfully',
    NOT_FOUND: 'Package not found',
  },

  // FAQ
  FAQ: {
    CREATED: 'FAQ created successfully',
    UPDATED: 'FAQ updated successfully',
    DELETED: 'FAQ deleted successfully',
    NOT_FOUND: 'FAQ not found',
  },

  // Portfolio
  PORTFOLIO: {
    CREATED: 'Portfolio project created successfully',
    UPDATED: 'Portfolio project updated successfully',
    DELETED: 'Portfolio project deleted successfully',
    NOT_FOUND: 'Portfolio project not found',
    IMAGE_ADDED: 'Portfolio image added successfully',
    IMAGE_DELETED: 'Portfolio image deleted successfully',
  },

  // Blog
  BLOG: {
    CREATED: 'Blog post created successfully',
    UPDATED: 'Blog post updated successfully',
    DELETED: 'Blog post deleted successfully',
    NOT_FOUND: 'Blog post not found',
    SLUG_EXISTS: 'A blog post with this slug already exists',
    PUBLISHED: 'Blog post published successfully',
    UNPUBLISHED: 'Blog post unpublished successfully',
  },

  // Team
  TEAM: {
    CREATED: 'Team member added successfully',
    UPDATED: 'Team member updated successfully',
    DELETED: 'Team member removed successfully',
    NOT_FOUND: 'Team member not found',
  },

  // Testimonial
  TESTIMONIAL: {
    CREATED: 'Testimonial created successfully',
    UPDATED: 'Testimonial updated successfully',
    DELETED: 'Testimonial deleted successfully',
    NOT_FOUND: 'Testimonial not found',
  },

  // Lead
  LEAD: {
    CREATED: 'Contact request submitted successfully',
    UPDATED: 'Lead updated successfully',
    DELETED: 'Lead deleted successfully',
    NOT_FOUND: 'Lead not found',
    NOTE_ADDED: 'Internal note added successfully',
  },

  // Media
  MEDIA: {
    UPLOADED: 'Media uploaded successfully',
    DELETED: 'Media deleted successfully',
    NOT_FOUND: 'Media not found',
    UPLOAD_FAILED: 'Media upload failed',
    INVALID_TYPE: 'Invalid file type',
    SIZE_EXCEEDED: 'File size exceeds the maximum limit',
  },

  // Settings
  SETTINGS: {
    FETCHED: 'Settings fetched successfully',
    UPDATED: 'Settings updated successfully',
  },

  // Validation
  VALIDATION: {
    FAILED: 'Validation failed',
    INVALID_OBJECT_ID: 'Invalid ObjectId format',
  },

  // Rate Limiting
  RATE_LIMIT: 'Too many requests. Please try again later.',

  // Server
  SERVER: {
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
    NOT_FOUND: 'The requested endpoint does not exist',
  },
});

export default MESSAGES;
