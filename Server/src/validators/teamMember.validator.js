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
  .string({ required_error: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters');

const designation = z
  .string({ required_error: 'Designation is required' })
  .trim()
  .min(2, 'Designation must be at least 2 characters')
  .max(100, 'Designation must not exceed 100 characters');

const bio = z.string().trim().max(500).optional();
const avatar = z
  .object({
    publicId: z.string().nullable().optional(),
    url: z.string().url('Invalid avatar URL').nullable().optional(),
  })
  .optional();

const socialLinks = z
  .object({
    linkedin: z.string().trim().optional(),
    twitter: z.string().trim().optional(),
    github: z.string().trim().optional(),
    instagram: z.string().trim().optional(),
    website: z.string().trim().optional(),
  })
  .optional();

const email = z.string().trim().email('Invalid email address').toLowerCase().optional().or(z.literal(''));
const phone = z.string().trim().optional();
const order = z.number().int().optional();
const isActive = z.boolean().optional();

// ─── Create TeamMember ──────────────────────────────────────────────────────
export const createTeamMemberSchema = z.object({
  name,
  designation,
  bio,
  avatar,
  socialLinks,
  email,
  phone,
  order,
  isActive,
});

// ─── Update TeamMember ──────────────────────────────────────────────────────
export const updateTeamMemberSchema = z
  .object({
    name: name.optional(),
    designation: designation.optional(),
    bio,
    avatar,
    socialLinks,
    email,
    phone,
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
