import { Router } from 'express';
import testimonialController from '../controllers/testimonial.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  idParamSchema,
} from '../validators/testimonial.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Testimonials
 *   description: Client review & testimonial management
 */

// ─── Public Routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/testimonials:
 *   get:
 *     summary: Get paginated testimonials list
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: List of testimonials
 */
router.get('/', testimonialController.getTestimonials);

/**
 * @swagger
 * /api/v1/testimonials/featured:
 *   get:
 *     summary: Get featured testimonials
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: Array of featured testimonials
 */
router.get('/featured', testimonialController.getFeaturedTestimonials);

/**
 * @swagger
 * /api/v1/testimonials/{id}:
 *   get:
 *     summary: Get testimonial by ID
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  testimonialController.getTestimonialById
);

// ─── Protected Routes (Admin / Manager) ─────────────────────────────────────

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER));

/**
 * @swagger
 * /api/v1/testimonials:
 *   post:
 *     summary: Create a new testimonial
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Testimonial created
 */
router.post(
  '/',
  validate({ body: createTestimonialSchema }),
  testimonialController.createTestimonial
);

/**
 * @swagger
 * /api/v1/testimonials/{id}:
 *   put:
 *     summary: Update testimonial by ID
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Testimonial updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTestimonialSchema }),
  testimonialController.updateTestimonial
);

/**
 * @swagger
 * /api/v1/testimonials/{id}:
 *   delete:
 *     summary: Delete testimonial by ID
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Testimonial deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  testimonialController.deleteTestimonial
);

export default router;
