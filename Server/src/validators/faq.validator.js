import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z
  .string()
  .trim()
  .transform((val) => val.replace(/^["']|["']$/g, '').trim())
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

const question = z
  .string({ required_error: 'Question is required' })
  .trim()
  .min(5, 'Question must be at least 5 characters')
  .max(300, 'Question must not exceed 300 characters');

const answer = z
  .string({ required_error: 'Answer is required' })
  .trim()
  .min(5, 'Answer must be at least 5 characters');

const service = objectId.nullable().optional();
const isGlobal = z.boolean().optional();
const category = z.string().trim().toLowerCase().optional();
const order = z.number().int().optional();
const isActive = z.boolean().optional();

// ─── Create FAQ ─────────────────────────────────────────────────────────────
export const createFaqSchema = z.object({
  question,
  answer,
  service,
  isGlobal,
  category,
  order,
  isActive,
});

// ─── Update FAQ ─────────────────────────────────────────────────────────────
export const updateFaqSchema = z
  .object({
    question: question.optional(),
    answer: answer.optional(),
    service,
    isGlobal,
    category,
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

export const serviceIdParamSchema = z.object({
  serviceId: objectId,
});
