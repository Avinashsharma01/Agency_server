import blogRepository from '../repositories/blog.repository.js';
import categoryRepository from '../repositories/category.repository.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import slugify from '../utils/slugify.js';

/**
 * Blog Service.
 * Business logic for blog posts, publishing workflows, reading time, and view counts.
 */
class BlogService {
  /**
   * Calculates estimated reading time in minutes (approx 200 WPM).
   *
   * @param {string} content - Rich text / markdown content
   * @returns {number} Estimated reading time in minutes
   */
  _calculateReadingTime(content) {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  /**
   * Generates a unique slug for a blog post.
   *
   * @param {string} text - Title or base text
   * @param {string} [excludeId] - ID to exclude
   * @returns {Promise<string>} Unique slug
   */
  async _generateUniqueSlug(text, excludeId = null) {
    let baseSlug = slugify(text);
    let candidateSlug = baseSlug;
    let counter = 1;

    while (await blogRepository.existsBySlug(candidateSlug, excludeId)) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return candidateSlug;
  }

  /**
   * Creates a new Blog post.
   *
   * @param {object} blogData - Blog post payload
   * @param {string} authorId - Authenticated user ID (author)
   * @returns {Promise<object>} Created blog document
   */
  async createBlog(blogData, authorId) {
    // Verify category exists
    const category = await categoryRepository.findById(blogData.category);
    if (!category || category.isDeleted) {
      throw ApiError.badRequest('Referenced category does not exist');
    }

    // Title uniqueness check
    const titleExists = await blogRepository.existsByTitle(blogData.title);
    if (titleExists) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Blog post with title '${blogData.title}' already exists`);
    }

    // Assign author
    blogData.author = authorId;

    // Calculate reading time
    blogData.readingTime = this._calculateReadingTime(blogData.content);

    // Set publishedAt if status is published
    if (blogData.status === 'published') {
      blogData.publishedAt = new Date();
    }

    // Generate unique slug
    blogData.slug = await this._generateUniqueSlug(blogData.slug || blogData.title);

    const createdBlog = await blogRepository.create(blogData);

    return blogRepository.findById(createdBlog._id, {
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'author', select: 'name email avatar' },
      ],
    });
  }

  /**
   * Gets paginated blog posts.
   *
   * @param {object} queryParams - Express req.query
   * @param {boolean} [isPublic=true] - If true, restricts list to published posts
   * @returns {Promise<{ data: object[], pagination: object }>}
   */
  async getBlogs(queryParams, isPublic = true) {
    const extraFilter = {};

    // Public API only returns published blogs
    if (isPublic) {
      extraFilter.status = 'published';
    } else if (queryParams.status) {
      extraFilter.status = queryParams.status;
    }

    if (queryParams.category) {
      extraFilter.category = queryParams.category;
    }

    if (queryParams.author) {
      extraFilter.author = queryParams.author;
    }

    if (queryParams.tag) {
      extraFilter.tags = queryParams.tag;
    }

    return blogRepository.findPaginated(queryParams, extraFilter, {
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'author', select: 'name email avatar' },
      ],
    });
  }

  /**
   * Gets a blog post by ID. Increments views count if public.
   *
   * @param {string} blogId - Blog ObjectId
   * @param {boolean} [incrementViews=false] - Whether to increment view count
   * @returns {Promise<object>}
   */
  async getBlogById(blogId, incrementViews = false) {
    const blog = await blogRepository.findById(blogId, {
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'author', select: 'name email avatar' },
      ],
    });

    if (!blog || blog.isDeleted) {
      throw ApiError.notFound('Blog post not found');
    }

    if (incrementViews) {
      await blogRepository.incrementViewsCount(blogId);
    }

    return blog;
  }

  /**
   * Gets a blog post by Slug. Increments views count.
   *
   * @param {string} slug - Blog slug
   * @returns {Promise<object>}
   */
  async getBlogBySlug(slug) {
    const blog = await blogRepository.findBySlug(slug);

    if (!blog || blog.status !== 'published') {
      throw ApiError.notFound('Blog post not found');
    }

    // Increment views count asynchronously
    blogRepository.incrementViewsCount(blog._id).catch(() => {});

    return blog;
  }

  /**
   * Updates a blog post.
   *
   * @param {string} blogId - Blog ObjectId
   * @param {object} updateData - Update fields
   * @returns {Promise<object>} Updated blog document
   */
  async updateBlog(blogId, updateData) {
    const existing = await blogRepository.findById(blogId);
    if (!existing || existing.isDeleted) {
      throw ApiError.notFound('Blog post not found');
    }

    // Verify category if changed
    if (updateData.category && updateData.category !== existing.category?.toString()) {
      const category = await categoryRepository.findById(updateData.category);
      if (!category || category.isDeleted) {
        throw ApiError.badRequest('Referenced category does not exist');
      }
    }

    // Re-calculate reading time if content changed
    if (updateData.content) {
      updateData.readingTime = this._calculateReadingTime(updateData.content);
    }

    // Handle status change to published
    if (updateData.status === 'published' && existing.status !== 'published' && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Title and slug update
    if (updateData.title && updateData.title.toLowerCase() !== existing.title.toLowerCase()) {
      const titleExists = await blogRepository.existsByTitle(updateData.title, blogId);
      if (titleExists) {
        throw new ApiError(HTTP_STATUS.CONFLICT, `Blog post with title '${updateData.title}' already exists`);
      }
      updateData.slug = await this._generateUniqueSlug(updateData.title, blogId);
    } else if (updateData.slug && updateData.slug !== existing.slug) {
      updateData.slug = await this._generateUniqueSlug(updateData.slug, blogId);
    }

    return blogRepository.updateById(blogId, updateData, {
      populate: [
        { path: 'category', select: 'name slug icon' },
        { path: 'author', select: 'name email avatar' },
      ],
    });
  }

  /**
   * Soft deletes a blog post.
   *
   * @param {string} blogId - Blog ObjectId
   * @returns {Promise<object>}
   */
  async deleteBlog(blogId) {
    const blog = await blogRepository.findById(blogId);
    if (!blog || blog.isDeleted) {
      throw ApiError.notFound('Blog post not found');
    }

    return blogRepository.softDeleteById(blogId);
  }
}

export default new BlogService();
