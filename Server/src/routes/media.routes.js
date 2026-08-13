import { Router } from 'express';
import mediaController from '../controllers/media.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { uploadSingleImage, uploadMultipleImages } from '../middlewares/upload.middleware.js';
import { updateMediaSchema, idParamSchema } from '../validators/media.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Cloudinary media library management (upload, browse, delete)
 */

// ─── All Media Routes Are Protected ─────────────────────────────────────────
router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.EDITOR));

/**
 * @swagger
 * /api/v1/media:
 *   post:
 *     summary: Upload a single media file
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *               alt:
 *                 type: string
 *               caption:
 *                 type: string
 *     responses:
 *       201:
 *         description: Media uploaded
 */
router.post('/', uploadSingleImage, mediaController.uploadMedia);

/**
 * @swagger
 * /api/v1/media/multiple:
 *   post:
 *     summary: Upload multiple media files
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Media files uploaded
 */
router.post('/multiple', uploadMultipleImages, mediaController.uploadMultipleMedia);

/**
 * @swagger
 * /api/v1/media:
 *   get:
 *     summary: Get paginated media library
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Media library listing
 */
router.get('/', mediaController.getMedia);

/**
 * @swagger
 * /api/v1/media/{id}:
 *   get:
 *     summary: Get media by ID
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Media details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  mediaController.getMediaById
);

/**
 * @swagger
 * /api/v1/media/{id}:
 *   put:
 *     summary: Update media metadata (alt, caption, folder)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Media updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateMediaSchema }),
  mediaController.updateMedia
);

/**
 * @swagger
 * /api/v1/media/{id}:
 *   delete:
 *     summary: Delete media from Cloudinary and database
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Media deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  mediaController.deleteMedia
);

export default router;
