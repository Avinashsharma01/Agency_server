/**
 * Shared enumerations used across multiple models and validators.
 */

export const STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

export const STATUS_LIST = Object.values(STATUS);

export const PACKAGE_TYPE = Object.freeze({
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  CUSTOM: 'custom',
});

export const PACKAGE_TYPE_LIST = Object.values(PACKAGE_TYPE);

export const LEAD_STATUS = Object.freeze({
  NEW: 'new',
  CONTACTED: 'contacted',
  IN_PROGRESS: 'in_progress',
  QUALIFIED: 'qualified',
  CONVERTED: 'converted',
  CLOSED: 'closed',
  SPAM: 'spam',
});

export const LEAD_STATUS_LIST = Object.values(LEAD_STATUS);

export const MEDIA_TYPE = Object.freeze({
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
});

export const MEDIA_TYPE_LIST = Object.values(MEDIA_TYPE);

export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

/**
 * Maximum number of refresh tokens stored per user.
 * Oldest tokens are rotated out when this limit is reached.
 */
export const MAX_REFRESH_TOKENS = 5;

/**
 * Password reset token expiry in milliseconds (1 hour).
 */
export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

/**
 * Default pagination values.
 */
export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

/**
 * Cloudinary upload folders.
 */
export const CLOUDINARY_FOLDERS = Object.freeze({
  SERVICES: 'agency-cms/services',
  PORTFOLIO: 'agency-cms/portfolio',
  BLOGS: 'agency-cms/blogs',
  TEAM: 'agency-cms/team',
  TESTIMONIALS: 'agency-cms/testimonials',
  MEDIA: 'agency-cms/media',
  SETTINGS: 'agency-cms/settings',
  USERS: 'agency-cms/users',
});

/**
 * Allowed MIME types for file uploads.
 */
export const ALLOWED_IMAGE_TYPES = Object.freeze([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

export const ALLOWED_VIDEO_TYPES = Object.freeze([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
]);

/**
 * Max file sizes in bytes.
 */
export const MAX_FILE_SIZE = Object.freeze({
  IMAGE: 5 * 1024 * 1024,    // 5MB
  VIDEO: 100 * 1024 * 1024,  // 100MB
});
