import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z
  .string()
  .trim()
  .transform((val) => val.replace(/^["']|["']$/g, '').trim())
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

const name = z
  .string({ required_error: 'Category name is required' })
  .trim()
  .min(2, 'Category name must be at least 2 characters')
  .max(100, 'Category name must not exceed 100 characters');

const description = z
  .string()
  .trim()
  .max(500, 'Description must not exceed 500 characters')
  .optional();

const icon = z.string().trim().optional();
const order = z.number().int().optional();
const isActive = z.boolean().optional();
const slug = z.string().trim().toLowerCase().optional();

// ─── Create Category ────────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  name,
  slug,
  description,
  icon,
  order,
  isActive,
});

// ─── Update Category ────────────────────────────────────────────────────────
export const updateCategorySchema = z
  .object({
    name: name.optional(),
    slug,
    description,
    icon,
    order,
    isActive,
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
