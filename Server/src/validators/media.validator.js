import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z
  .string()
  .trim()
  .transform((val) => val.replace(/^["']|["']$/g, '').trim())
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

// ─── Update Media Metadata ──────────────────────────────────────────────────
export const updateMediaSchema = z
  .object({
    alt: z.string().trim().max(255).optional(),
    caption: z.string().trim().max(500).optional(),
    folder: z.string().trim().max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// ─── Params ─────────────────────────────────────────────────────────────────
export const idParamSchema = z.object({
  id: objectId,
});
