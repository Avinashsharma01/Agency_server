import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_FILE_SIZE } from '../constants/index.js';
import ApiError from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads');

/**
 * Multer disk storage configuration.
 * Files are saved to src/uploads/ with UUID-prefixed filenames.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter that accepts only images.
 */
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`),
      false
    );
  }
};

/**
 * File filter that accepts images and videos.
 */
const mediaFilter = (req, file, cb) => {
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(`Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`),
      false
    );
  }
};

/**
 * Upload middleware for a single image.
 * Field name: 'image'
 * Max size: 5MB
 */
export const uploadSingleImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE.IMAGE },
}).single('image');

/**
 * Upload middleware for multiple images.
 * Field name: 'images'
 * Max count: 10
 * Max size per file: 5MB
 */
export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE.IMAGE },
}).array('images', 10);

/**
 * Upload middleware for mixed media (images + videos).
 * Field name: 'media'
 * Max size: 100MB (to accommodate videos)
 */
export const uploadMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: { fileSize: MAX_FILE_SIZE.VIDEO },
}).single('media');

/**
 * Upload middleware for service banners and galleries.
 * Accepts a banner image and multiple gallery images in a single request.
 */
export const uploadServiceImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE.IMAGE },
}).fields([
  { name: 'bannerImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);

/**
 * Generic upload middleware factory.
 *
 * @param {string} fieldName - Form field name
 * @param {number} maxCount - Maximum number of files
 * @param {'image'|'media'} type - Filter type
 * @returns {Function} Multer middleware
 */
export const uploadFiles = (fieldName, maxCount = 1, type = 'image') => {
  const filter = type === 'media' ? mediaFilter : imageFilter;
  const maxSize = type === 'media' ? MAX_FILE_SIZE.VIDEO : MAX_FILE_SIZE.IMAGE;

  if (maxCount === 1) {
    return multer({ storage, fileFilter: filter, limits: { fileSize: maxSize } }).single(fieldName);
  }

  return multer({ storage, fileFilter: filter, limits: { fileSize: maxSize } }).array(fieldName, maxCount);
};
