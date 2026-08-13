import { z } from 'zod';

const imageSchema = z
  .object({
    publicId: z.string().nullable().optional(),
    url: z.string().url('Invalid URL').nullable().optional(),
  })
  .optional();

const socialLinksSchema = z
  .object({
    facebook: z.string().trim().optional(),
    twitter: z.string().trim().optional(),
    linkedin: z.string().trim().optional(),
    instagram: z.string().trim().optional(),
    youtube: z.string().trim().optional(),
    github: z.string().trim().optional(),
  })
  .optional();

const seoSchema = z
  .object({
    metaTitle: z.string().trim().max(200).optional(),
    metaDescription: z.string().trim().max(500).optional(),
    ogImage: imageSchema,
  })
  .optional();

const analyticsSchema = z
  .object({
    googleAnalyticsId: z.string().trim().optional(),
    facebookPixelId: z.string().trim().optional(),
  })
  .optional();

// ─── Update Settings ────────────────────────────────────────────────────────
export const updateSettingsSchema = z
  .object({
    siteName: z.string().trim().max(200).optional(),
    siteTagline: z.string().trim().max(300).optional(),
    siteLogo: imageSchema,
    favicon: imageSchema,
    contactEmail: z.string().trim().email('Invalid email').optional().or(z.literal('')),
    contactPhone: z.string().trim().optional(),
    contactAddress: z.string().trim().max(500).optional(),
    socialLinks: socialLinksSchema,
    seo: seoSchema,
    footerText: z.string().trim().max(1000).optional(),
    maintenanceMode: z.boolean().optional(),
    analytics: analyticsSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
