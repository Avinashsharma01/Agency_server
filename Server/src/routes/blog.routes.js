import { Router } from 'express';
import blogController from '../controllers/blog.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  createBlogSchema,
  updateBlogSchema,
  idParamSchema,
  slugParamSchema,
} from '../validators/blog.validator.js';
import { ROLES } from '../constants/index.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog post & content publication management
 */

// ─── Public Routes ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: Get paginated published blog posts
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of published blog posts
 */
router.get('/', blogController.getBlogs);

/**
 * @swagger
 * /api/v1/blogs/slug/{slug}:
 *   get:
 *     summary: Get blog post by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post details
 */
router.get(
  '/slug/:slug',
  validate({ params: slugParamSchema }),
  blogController.getBlogBySlug
);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   get:
 *     summary: Get blog post by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post details
 */
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  blogController.getBlogById
);

// ─── Protected Routes (Admin / Manager / Editor) ────────────────────────────

router.use(authenticate);
router.use(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.EDITOR));

/**
 * @swagger
 * /api/v1/blogs/admin/all:
 *   get:
 *     summary: Get all blog posts including drafts/archived (Admin)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all blog posts
 */
router.get('/admin/all', blogController.getAllBlogsAdmin);

/**
 * @swagger
 * /api/v1/blogs:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Blog post created
 */
router.post(
  '/',
  validate({ body: createBlogSchema }),
  blogController.createBlog
);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   put:
 *     summary: Update blog post by ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog post updated
 */
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateBlogSchema }),
  blogController.updateBlog
);

/**
 * @swagger
 * /api/v1/blogs/{id}:
 *   delete:
 *     summary: Delete blog post by ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog post deleted
 */
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  blogController.deleteBlog
);

export default router;
