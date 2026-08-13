import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z
  .string()
  .trim()
  .transform((val) => val.replace(/^["']|["']$/g, '').trim())
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

const title = z
  .string({ required_error: 'Blog title is required' })
  .trim()
  .min(2, 'Title must be at least 2 characters')
  .max(200, 'Title must not exceed 200 characters');

const content = z
  .string({ required_error: 'Blog content is required' })
  .min(5, 'Content must be at least 5 characters');

const excerpt = z.string().trim().max(400).optional();
const category = objectId;
const featuredImage = z
  .object({
    publicId: z.string().nullable().optional(),
    url: z.string().url('Invalid image URL').nullable().optional(),
  })
  .optional();

const tags = z.array(z.string().trim()).optional();
const status = z.enum(['draft', 'published', 'archived']).optional();
const metaTitle = z.string().trim().max(100).optional();
const metaDescription = z.string().trim().max(200).optional();
const slug = z.string().trim().toLowerCase().optional();

// ─── Create Blog ────────────────────────────────────────────────────────────
export const createBlogSchema = z.object({
  title,
  slug,
  content,
  excerpt,
  category,
  featuredImage,
  tags,
  status,
  metaTitle,
  metaDescription,
});

// ─── Update Blog ────────────────────────────────────────────────────────────
export const updateBlogSchema = z
  .object({
    title: title.optional(),
    slug,
    content: content.optional(),
    excerpt,
    category: category.optional(),
    featuredImage,
    tags,
    status,
    metaTitle,
    metaDescription,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// ─── Params ─────────────────────────────────────────────────────────────────
export const idParamSchema = z.object({
  id: objectId,
});

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1, 'Slug is required'),
});

export const categoryIdParamSchema = z.object({
  categoryId: objectId,
});
