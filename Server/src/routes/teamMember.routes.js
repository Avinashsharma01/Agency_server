import { Router } from 'express';
import teamMemberController from '../controllers/teamMember.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  idParamSchema,
} from '../validators/teamMember.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Team
 *   description: Agency staff and team member management
 */

// ─── Public Routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/team:
 *   get:
 *     summary: Get paginated team members list
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: List of team members
 */
router.get('/', teamMemberController.getMembers);

/**
 * @swagger
 * /api/v1/team/active:
 *   get:
 *     summary: Get all active team members (unpaginated)
 *     tags: [Team]
 *     responses:
 *       200:
 *         description: Array of active team members
 */
router.get('/active', teamMemberController.getActiveMembers);

/**
 * @swagger
 * /api/v1/team/{id}:
 *   get:
 *     summary: Get team member by ID
 *     tags: [Team]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team member details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  teamMemberController.getMemberById
);

// ─── Protected Routes (Admin / Manager) ─────────────────────────────────────

router.use(authenticate);
router.use(authorize(ROLES.ADMIN, ROLES.MANAGER));

/**
 * @swagger
 * /api/v1/team:
 *   post:
 *     summary: Create a new team member
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Team member created
 */
router.post(
  '/',
  validate({ body: createTeamMemberSchema }),
  teamMemberController.createMember
);

/**
 * @swagger
 * /api/v1/team/{id}:
 *   put:
 *     summary: Update team member by ID
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team member updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTeamMemberSchema }),
  teamMemberController.updateMember
);

/**
 * @swagger
 * /api/v1/team/{id}:
 *   delete:
 *     summary: Delete team member by ID
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team member deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  teamMemberController.deleteMember
);

export default router;
