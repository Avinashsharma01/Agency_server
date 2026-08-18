import { Router } from 'express';
import settingController from '../controllers/setting.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import { updateSettingsSchema } from '../validators/setting.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Singleton website configuration management
 */

// ─── Public Route (Frontend needs settings for rendering) ───────────────────

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Get global website settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Website settings
 */
router.get('/', settingController.getSettings);

// ─── Protected Routes (Admin only) ─────────────────────────────────────────

/**
 * @swagger
 * /api/v1/settings:
 *   put:
 *     summary: Update global website settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.put(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate({ body: updateSettingsSchema }),
  settingController.updateSettings
);

/**
 * @swagger
 * /api/v1/settings/logo:
 *   put:
 *     summary: Upload/replace site logo
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo updated
 */
router.put(
  '/logo',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadSingleImage,
  settingController.updateLogo
);

/**
 * @swagger
 * /api/v1/settings/favicon:
 *   put:
 *     summary: Upload/replace favicon
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Favicon updated
 */
router.put(
  '/favicon',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadSingleImage,
  settingController.updateFavicon
);

/**
 * @swagger
 * /api/v1/settings/og-image:
 *   put:
 *     summary: Upload/replace SEO Open Graph image
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: OG image updated
 */
router.put(
  '/og-image',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadSingleImage,
  settingController.updateOgImage
);

export default router;
