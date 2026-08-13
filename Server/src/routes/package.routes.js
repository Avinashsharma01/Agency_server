import { Router } from 'express';
import packageController from '../controllers/package.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createPackageSchema,
  updatePackageSchema,
  idParamSchema,
  serviceIdParamSchema,
} from '../validators/package.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Packages
 *   description: Service pricing package management
 */

// ─── Public Routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/packages:
 *   get:
 *     summary: Get paginated list of packages
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: List of packages
 */
router.get('/', packageController.getPackages);

/**
 * @swagger
 * /api/v1/packages/service/{serviceId}:
 *   get:
 *     summary: Get packages by service ID
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Packages for specified service
 */
router.get(
  '/service/:serviceId',
  validate({ params: serviceIdParamSchema }),
  packageController.getPackagesByService
);

/**
 * @swagger
 * /api/v1/packages/{id}:
 *   get:
 *     summary: Get package by ID
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  packageController.getPackageById
);

// ─── Protected Routes (Admin / Manager) ─────────────────────────────────────

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER));

/**
 * @swagger
 * /api/v1/packages:
 *   post:
 *     summary: Create a new package
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Package created
 */
router.post(
  '/',
  validate({ body: createPackageSchema }),
  packageController.createPackage
);

/**
 * @swagger
 * /api/v1/packages/{id}:
 *   put:
 *     summary: Update package by ID
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Package updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updatePackageSchema }),
  packageController.updatePackage
);

/**
 * @swagger
 * /api/v1/packages/{id}:
 *   delete:
 *     summary: Delete package by ID
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Package deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  packageController.deletePackage
);

export default router;
