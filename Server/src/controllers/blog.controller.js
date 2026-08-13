import blogService from '../services/blog.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Blog Controller.
 * Handles HTTP requests for blog posts.
 */
class BlogController {
  /**
   * POST /api/v1/blogs
   * Creates a new blog post (Protected: Admin/Manager/Editor).
   */
  createBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.createBlog(req.body, req.user.id);

    res.status(HTTP_STATUS.CREATED).json(
      ApiResponse.created(blog, 'Blog post created successfully')
    );
  });

  /**
   * GET /api/v1/blogs
   * Gets paginated published blog posts (Public).
   */
  getBlogs = asyncHandler(async (req, res) => {
    const { data, pagination } = await blogService.getBlogs(req.query, true);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'Blog posts fetched successfully')
    );
  });

  /**
   * GET /api/v1/blogs/admin/all
   * Gets all blog posts including drafts/archived (Protected: Admin/Manager/Editor).
   */
  getAllBlogsAdmin = asyncHandler(async (req, res) => {
    const { data, pagination } = await blogService.getBlogs(req.query, false);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.paginated(data, pagination, 'All blog posts fetched successfully')
    );
  });

  /**
   * GET /api/v1/blogs/slug/:slug
   * Gets a blog post by slug (Public). Increments views count.
   */
  getBlogBySlug = asyncHandler(async (req, res) => {
    const blog = await blogService.getBlogBySlug(req.params.slug);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(blog, 'Blog post fetched successfully')
    );
  });

  /**
   * GET /api/v1/blogs/:id
   * Gets a blog post by ID (Public).
   */
  getBlogById = asyncHandler(async (req, res) => {
    const blog = await blogService.getBlogById(req.params.id, true);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(blog, 'Blog post fetched successfully')
    );
  });

  /**
   * PUT /api/v1/blogs/:id
   * Updates a blog post by ID (Protected: Admin/Manager/Editor).
   */
  updateBlog = asyncHandler(async (req, res) => {
    const blog = await blogService.updateBlog(req.params.id, req.body);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(blog, 'Blog post updated successfully')
    );
  });

  /**
   * DELETE /api/v1/blogs/:id
   * Deletes a blog post by ID (Protected: Admin/Manager/Editor).
   */
  deleteBlog = asyncHandler(async (req, res) => {
    await blogService.deleteBlog(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ApiResponse.ok(null, 'Blog post deleted successfully')
    );
  });
}

export default new BlogController();
