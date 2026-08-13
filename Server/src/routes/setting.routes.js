import { Router } from 'express';
import settingController from '../controllers/setting.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
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

// ─── Protected Route (Admin only) ──────────────────────────────────────────

/**
 * @swagger
 * /api/v1/settings:
 *   put:
 *     summary: Update global website settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.put(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  validate({ body: updateSettingsSchema }),
  settingController.updateSettings
);

export default router;
