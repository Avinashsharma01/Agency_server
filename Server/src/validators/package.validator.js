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
  .string({ required_error: 'Package name is required' })
  .trim()
  .min(2, 'Package name must be at least 2 characters')
  .max(100, 'Package name must not exceed 100 characters');

const service = objectId;

const packageType = z
  .enum(['basic', 'standard', 'premium', 'custom'], {
    errorMap: () => ({ message: 'packageType must be one of: basic, standard, premium, custom' }),
  })
  .optional();

const price = z
  .number({ required_error: 'Price is required' })
  .min(0, 'Price cannot be negative');

const currency = z.string().trim().toUpperCase().optional();

const billingPeriod = z
  .enum(['one_time', 'monthly', 'yearly'], {
    errorMap: () => ({ message: 'billingPeriod must be one of: one_time, monthly, yearly' }),
  })
  .optional();

const description = z.string().trim().max(500).optional();

const featureItem = z.object({
  text: z.string({ required_error: 'Feature text is required' }).trim().min(1),
  isIncluded: z.boolean().optional().default(true),
});

const features = z.array(featureItem).optional();
const isPopular = z.boolean().optional();
const isActive = z.boolean().optional();
const order = z.number().int().optional();

// ─── Create Package ─────────────────────────────────────────────────────────
export const createPackageSchema = z.object({
  name,
  service,
  packageType,
  price,
  currency,
  billingPeriod,
  description,
  features,
  isPopular,
  isActive,
  order,
});

// ─── Update Package ─────────────────────────────────────────────────────────
export const updatePackageSchema = z
  .object({
    name: name.optional(),
    service: service.optional(),
    packageType,
    price: price.optional(),
    currency,
    billingPeriod,
    description,
    features,
    isPopular,
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

export const serviceIdParamSchema = z.object({
  serviceId: objectId,
});
