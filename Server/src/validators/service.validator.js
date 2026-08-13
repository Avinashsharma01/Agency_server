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
  .string({ required_error: 'Service title is required' })
  .trim()
  .min(2, 'Service title must be at least 2 characters')
  .max(150, 'Service title must not exceed 150 characters');

const category = objectId;

const shortDescription = z
  .string()
  .trim()
  .max(300, 'Short description must not exceed 300 characters')
  .optional();

const fullDescription = z.string().optional();
const icon = z.string().trim().optional();
const featuredImage = z
  .object({
    publicId: z.string().nullable().optional(),
    url: z.string().url('Invalid image URL').nullable().optional(),
  })
  .optional();

const isFeatured = z.boolean().optional();
const isActive = z.boolean().optional();
const order = z.number().int().optional();
const metaTitle = z.string().trim().max(100).optional();
const metaDescription = z.string().trim().max(200).optional();
const tags = z.array(z.string().trim()).optional();
const slug = z.string().trim().toLowerCase().optional();

// ─── Create Service ─────────────────────────────────────────────────────────
export const createServiceSchema = z.object({
  title,
  slug,
  category,
  shortDescription,
  fullDescription,
  icon,
  featuredImage,
  isFeatured,
  isActive,
  order,
  metaTitle,
  metaDescription,
  tags,
});

// ─── Update Service ─────────────────────────────────────────────────────────
export const updateServiceSchema = z
  .object({
    title: title.optional(),
    slug,
    category: category.optional(),
    shortDescription,
    fullDescription,
    icon,
    featuredImage,
    isFeatured,
    isActive,
    order,
    metaTitle,
    metaDescription,
    tags,
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
