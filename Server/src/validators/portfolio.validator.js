import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

const title = z
  .string({ required_error: 'Portfolio title is required' })
  .trim()
  .min(2, 'Title must be at least 2 characters')
  .max(150, 'Title must not exceed 150 characters');

const category = objectId;
const service = objectId.nullable().optional();
const client = z.string().trim().optional();
const shortDescription = z.string().trim().max(300).optional();
const fullDescription = z.string().optional();

const featuredImage = z
  .object({
    publicId: z.string().nullable().optional(),
    url: z.string().url('Invalid image URL').nullable().optional(),
  })
  .optional();

const galleryImage = z.object({
  publicId: z.string({ required_error: 'Gallery image publicId is required' }),
  url: z.string({ required_error: 'Gallery image URL is required' }).url('Invalid image URL'),
  caption: z.string().optional(),
  order: z.number().int().optional(),
});

const galleryImages = z.array(galleryImage).optional();
const technologies = z.array(z.string().trim()).optional();
const projectUrl = z.string().trim().optional();
const githubUrl = z.string().trim().optional();
const completionDate = z.string().datetime({ offset: true }).or(z.string()).optional();
const isFeatured = z.boolean().optional();
const isActive = z.boolean().optional();
const order = z.number().int().optional();
const metaTitle = z.string().trim().max(100).optional();
const metaDescription = z.string().trim().max(200).optional();
const slug = z.string().trim().toLowerCase().optional();

// ─── Create Portfolio ───────────────────────────────────────────────────────
export const createPortfolioSchema = z.object({
  title,
  slug,
  client,
  category,
  service,
  shortDescription,
  fullDescription,
  featuredImage,
  galleryImages,
  technologies,
  projectUrl,
  githubUrl,
  completionDate,
  isFeatured,
  isActive,
  order,
  metaTitle,
  metaDescription,
});

// ─── Update Portfolio ───────────────────────────────────────────────────────
export const updatePortfolioSchema = z
  .object({
    title: title.optional(),
    slug,
    client,
    category: category.optional(),
    service,
    shortDescription,
    fullDescription,
    featuredImage,
    galleryImages,
    technologies,
    projectUrl,
    githubUrl,
    completionDate,
    isFeatured,
    isActive,
    order,
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
