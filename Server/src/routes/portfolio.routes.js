import { Router } from 'express';
import portfolioController from '../controllers/portfolio.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  idParamSchema,
  slugParamSchema,
} from '../validators/portfolio.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Portfolio
 *   description: Portfolio project showcase & gallery management
 */

// ─── Public Routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/portfolio:
 *   get:
 *     summary: Get paginated list of portfolio projects
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: List of portfolio items
 */
router.get('/', portfolioController.getPortfolios);

/**
 * @swagger
 * /api/v1/portfolio/featured:
 *   get:
 *     summary: Get featured portfolio projects
 *     tags: [Portfolio]
 *     responses:
 *       200:
 *         description: Array of featured projects
 */
router.get('/featured', portfolioController.getFeaturedProjects);

/**
 * @swagger
 * /api/v1/portfolio/slug/{slug}:
 *   get:
 *     summary: Get portfolio item by slug
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Portfolio project details
 */
router.get(
  '/slug/:slug',
  validate({ params: slugParamSchema }),
  portfolioController.getPortfolioBySlug
);

/**
 * @swagger
 * /api/v1/portfolio/{id}:
 *   get:
 *     summary: Get portfolio item by ID
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Portfolio project details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  portfolioController.getPortfolioById
);

// ─── Protected Routes (Admin / Manager / Editor) ────────────────────────────

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.EDITOR));

/**
 * @swagger
 * /api/v1/portfolio:
 *   post:
 *     summary: Create a new portfolio item
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Portfolio item created
 */
router.post(
  '/',
  validate({ body: createPortfolioSchema }),
  portfolioController.createPortfolio
);

/**
 * @swagger
 * /api/v1/portfolio/{id}:
 *   put:
 *     summary: Update portfolio item by ID
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio item updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updatePortfolioSchema }),
  portfolioController.updatePortfolio
);

/**
 * @swagger
 * /api/v1/portfolio/{id}:
 *   delete:
 *     summary: Delete portfolio item by ID
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio item deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  portfolioController.deletePortfolio
);

export default router;
