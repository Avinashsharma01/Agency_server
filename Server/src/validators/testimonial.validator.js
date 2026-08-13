import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z
  .string()
  .trim()
  .transform((val) => val.replace(/^["']|["']$/g, '').trim())
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

const clientName = z
  .string({ required_error: 'Client name is required' })
  .trim()
  .min(2, 'Client name must be at least 2 characters')
  .max(100, 'Client name must not exceed 100 characters');

const clientDesignation = z.string().trim().optional();
const clientCompany = z.string().trim().optional();
const clientAvatar = z
  .object({
    publicId: z.string().nullable().optional(),
    url: z.string().url('Invalid avatar URL').nullable().optional(),
  })
  .optional();

const content = z
  .string({ required_error: 'Testimonial content is required' })
  .trim()
  .min(5, 'Content must be at least 5 characters')
  .max(1000, 'Content must not exceed 1000 characters');

const rating = z.number().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5').optional();
const service = objectId.nullable().optional();
const isFeatured = z.boolean().optional();
const isActive = z.boolean().optional();
const order = z.number().int().optional();

// ─── Create Testimonial ─────────────────────────────────────────────────────
export const createTestimonialSchema = z.object({
  clientName,
  clientDesignation,
  clientCompany,
  clientAvatar,
  content,
  rating,
  service,
  isFeatured,
  isActive,
  order,
});

// ─── Update Testimonial ─────────────────────────────────────────────────────
export const updateTestimonialSchema = z
  .object({
    clientName: clientName.optional(),
    clientDesignation,
    clientCompany,
    clientAvatar,
    content: content.optional(),
    rating,
    service,
    isFeatured,
    isActive,
    order,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// ─── Params ─────────────────────────────────────────────────────────────────
export const idParamSchema = z.object({
  id: objectId,
});
