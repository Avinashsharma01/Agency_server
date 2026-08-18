import { Router } from 'express';
import serviceController from '../controllers/service.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createServiceSchema,
  updateServiceSchema,
  idParamSchema,
  slugParamSchema,
  categoryIdParamSchema,
} from '../validators/service.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service management and catalog API
 */

// ─── Public Routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/services:
 *   get:
 *     summary: Get paginated list of services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/', serviceController.getServices);

/**
 * @swagger
 * /api/v1/services/featured:
 *   get:
 *     summary: Get featured services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Array of featured services
 */
router.get('/featured', serviceController.getFeaturedServices);

/**
 * @swagger
 * /api/v1/services/category/{categoryId}:
 *   get:
 *     summary: Get services by category ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of services in category
 */
router.get(
  '/category/:categoryId',
  validate({ params: categoryIdParamSchema }),
  serviceController.getServicesByCategory
);

/**
 * @swagger
 * /api/v1/services/slug/{slug}:
 *   get:
 *     summary: Get service by slug
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 */
router.get(
  '/slug/:slug',
  validate({ params: slugParamSchema }),
  serviceController.getServiceBySlug
);

/**
 * @swagger
 * /api/v1/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  serviceController.getServiceById
);

// ─── Protected Routes (Admin / Manager) ─────────────────────────────────────

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

/**
 * @swagger
 * /api/v1/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Service created
 */
router.post(
  '/',
  validate({ body: createServiceSchema }),
  serviceController.createService
);

/**
 * @swagger
 * /api/v1/services/{id}:
 *   put:
 *     summary: Update service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateServiceSchema }),
  serviceController.updateService
);

/**
 * @swagger
 * /api/v1/services/{id}:
 *   delete:
 *     summary: Delete service by ID
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  serviceController.deleteService
);

export default router;
