import { z } from 'zod';

/**
 * Reusable Zod field definitions for auth-related validation.
 */
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

// ─── Login ──────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

// ─── Forgot Password ────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email,
});

// ─── Reset Password ─────────────────────────────────────────────────────────
export const resetPasswordSchema = z.object({
  password,
  confirmPassword: z.string({ required_error: 'Confirm password is required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ─── Reset Password Params ──────────────────────────────────────────────────
export const resetPasswordParamsSchema = z.object({
  token: z.string({ required_error: 'Reset token is required' }).min(1, 'Reset token is required'),
});

// ─── Change Password ────────────────────────────────────────────────────────
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: password,
  confirmPassword: z.string({ required_error: 'Confirm password is required' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from the current password',
  path: ['newPassword'],
});

// ─── Register Admin ─────────────────────────────────────────────────────────
export const registerAdminSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email,
  password,
  confirmPassword: z.string({ required_error: 'Confirm password is required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
