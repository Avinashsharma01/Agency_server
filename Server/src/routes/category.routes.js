import { Router } from 'express';
import categoryController from '../controllers/category.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
  slugParamSchema,
} from '../validators/category.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Service category management
 */

// ─── Public Routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get paginated list of categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', categoryController.getCategories);

/**
 * @swagger
 * /api/v1/categories/active:
 *   get:
 *     summary: Get all active categories (unpaginated)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of active categories
 */
router.get('/active', categoryController.getActiveCategories);

/**
 * @swagger
 * /api/v1/categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 */
router.get(
  '/slug/:slug',
  validate({ params: slugParamSchema }),
  categoryController.getCategoryBySlug
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  categoryController.getCategoryById
);

// ─── Protected Routes (Admin / Manager) ─────────────────────────────────────

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       21:
 *         description: Category created
 */
router.post(
  '/',
  validate({ body: createCategorySchema }),
  categoryController.createCategory
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Update category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateCategorySchema }),
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  categoryController.deleteCategory
);

export default router;
