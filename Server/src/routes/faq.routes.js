import { Router } from 'express';
import faqController from '../controllers/faq.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createFaqSchema,
  updateFaqSchema,
  idParamSchema,
  serviceIdParamSchema,
} from '../validators/faq.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: FAQs
 *   description: Frequently Asked Questions management
 */

// ─── Public Routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/faqs:
 *   get:
 *     summary: Get paginated list of FAQs
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: List of FAQs
 */
router.get('/', faqController.getFaqs);

/**
 * @swagger
 * /api/v1/faqs/global:
 *   get:
 *     summary: Get global site FAQs
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: Array of global FAQs
 */
router.get('/global', faqController.getGlobalFaqs);

/**
 * @swagger
 * /api/v1/faqs/service/{serviceId}:
 *   get:
 *     summary: Get FAQs by service ID
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQs for specified service
 */
router.get(
  '/service/:serviceId',
  validate({ params: serviceIdParamSchema }),
  faqController.getFaqsByService
);

/**
 * @swagger
 * /api/v1/faqs/{id}:
 *   get:
 *     summary: Get FAQ by ID
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  faqController.getFaqById
);

// ─── Protected Routes (Admin / Manager) ─────────────────────────────────────

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER));

/**
 * @swagger
 * /api/v1/faqs:
 *   post:
 *     summary: Create a new FAQ
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: FAQ created
 */
router.post(
  '/',
  validate({ body: createFaqSchema }),
  faqController.createFaq
);

/**
 * @swagger
 * /api/v1/faqs/{id}:
 *   put:
 *     summary: Update FAQ by ID
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FAQ updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateFaqSchema }),
  faqController.updateFaq
);

/**
 * @swagger
 * /api/v1/faqs/{id}:
 *   delete:
 *     summary: Delete FAQ by ID
 *     tags: [FAQs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FAQ deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  faqController.deleteFaq
);

export default router;
