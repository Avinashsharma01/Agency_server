import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  idParamSchema,
} from '../validators/user.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin) & profile management
 */

// ─── Profile Routes (self-management) ───────────────────────────────────────

/**
 * @swagger
 * /api/v1/users/profile/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */
router.get('/profile/me', userController.getProfile);

/**
 * @swagger
 * /api/v1/users/profile/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put(
  '/profile/me',
  validate({ body: updateProfileSchema }),
  userController.updateProfile
);

/**
 * @swagger
 * /api/v1/users/profile/avatar:
 *   put:
 *     summary: Upload/update avatar
 *     tags: [Users]
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
 *         description: Avatar updated successfully
 */
router.put('/profile/avatar', uploadSingleImage, userController.updateAvatar);

// ─── Admin User Management Routes ───────────────────────────────────────────

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field(s), prefix with - for descending
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Users list with pagination
 */
router.get(
  '/',
  authorize(ROLES.ADMIN),
  userController.getAllUsers
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 description: Role ObjectId
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Email already exists
 */
router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate({ body: createUserSchema }),
  userController.createUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: idParamSchema }),
  userController.getUserById
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: idParamSchema, body: updateUserSchema }),
  userController.updateUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  validate({ params: idParamSchema }),
  userController.deleteUser
);

export default router;
