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

const email = z
  .string({ required_error: 'Email is required' })
  .trim()
  .email('Please provide a valid email address')
  .toLowerCase();

const phone = z.string().trim().optional();
const company = z.string().trim().optional();
const service = objectId.nullable().optional();
const subject = z.string().trim().max(200).optional();
const message = z
  .string({ required_error: 'Message is required' })
  .trim()
  .min(5, 'Message must be at least 5 characters')
  .max(2000, 'Message must not exceed 2000 characters');

const budget = z.string().trim().optional();

const status = z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'rejected'], {
  errorMap: () => ({ message: 'Invalid lead status' }),
});

const noteContent = z
  .string({ required_error: 'Note content is required' })
  .trim()
  .min(1, 'Note content cannot be empty');

// ─── General Update Lead ──────────────────────────────────────────────────
export const updateLeadSchema = z
  .object({
    name: name.optional(),
    email: email.optional(),
    phone,
    company,
    service,
    subject,
    message: message.optional(),
    budget,
    status,
    assignedTo: objectId.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// ─── Public Lead Submit ─────────────────────────────────────────────────────
export const createLeadSchema = z.object({
  name,
  email,
  phone,
  company,
  service,
  subject,
  message,
  budget,
});

// ─── Update Lead Status ─────────────────────────────────────────────────────
export const updateLeadStatusSchema = z.object({
  status,
});

// ─── Assign Lead ────────────────────────────────────────────────────────────
export const assignLeadSchema = z.object({
  assignedTo: objectId.nullable(),
});

// ─── Add Note ───────────────────────────────────────────────────────────────
export const addLeadNoteSchema = z.object({
  content: noteContent,
});

// ─── Params ─────────────────────────────────────────────────────────────────
export const idParamSchema = z.object({
  id: objectId,
});
