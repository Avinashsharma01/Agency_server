import { Router } from 'express';
import leadController from '../controllers/lead.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  addLeadNoteSchema,
  idParamSchema,
} from '../validators/lead.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Contact form inquiries & sales lead pipeline management
 */

// ─── Public Route (Contact Form Submission) ─────────────────────────────────

/**
 * @swagger
 * /api/v1/leads:
 *   post:
 *     summary: Submit a contact form inquiry / lead
 *     tags: [Leads]
 *     responses:
 *       201:
 *         description: Lead submission successful
 */
router.post(
  '/',
  validate({ body: createLeadSchema }),
  leadController.createLead
);

// ─── Protected Routes (Admin / Manager) ─────────────────────────────────────

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

/**
 * @swagger
 * /api/v1/leads:
 *   get:
 *     summary: Get paginated leads pipeline list
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get('/', leadController.getLeads);

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   get:
 *     summary: Get lead details by ID
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lead details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  leadController.getLeadById
);

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   put:
 *     summary: Update lead by ID
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lead updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateLeadSchema }),
  leadController.updateLead
);

/**
 * @swagger
 * /api/v1/leads/{id}/status:
 *   put:
 *     summary: Update lead pipeline status
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lead status updated
 */
router.put(
  '/:id/status',
  validate({ params: idParamSchema, body: updateLeadStatusSchema }),
  leadController.updateStatus
);

/**
 * @swagger
 * /api/v1/leads/{id}/assign:
 *   put:
 *     summary: Assign lead to an admin staff user
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lead assigned
 */
router.put(
  '/:id/assign',
  validate({ params: idParamSchema, body: assignLeadSchema }),
  leadController.assignLead
);

/**
 * @swagger
 * /api/v1/leads/{id}/notes:
 *   post:
 *     summary: Add internal note to lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Note added
 */
router.post(
  '/:id/notes',
  validate({ params: idParamSchema, body: addLeadNoteSchema }),
  leadController.addNote
);

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   delete:
 *     summary: Delete lead by ID
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lead deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  leadController.deleteLead
);

export default router;
