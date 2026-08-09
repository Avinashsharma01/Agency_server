import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Reusable Zod field definitions for user validation.
 */
const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

const name = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters');

const email = z
  .string({ required_error: 'Email is required' })
  .trim()
  .email('Please provide a valid email address')
  .toLowerCase();

const password = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

// ─── Create User ────────────────────────────────────────────────────────────
export const createUserSchema = z.object({
  name,
  email,
  password,
  role: z
    .string({ required_error: 'Role is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Role is required')
    .describe('Role name (e.g., admin, manager, editor)'),
  isActive: z.boolean().optional().default(true),
});

// ─── Update User ────────────────────────────────────────────────────────────
export const updateUserSchema = z.object({
  name: name.optional(),
  email: email.optional(),
  role: z.string().trim().toLowerCase().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// ─── Update Profile (self) ──────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  name: name.optional(),
  email: email.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// ─── ID Param ───────────────────────────────────────────────────────────────
export const idParamSchema = z.object({
  id: objectId,
});
