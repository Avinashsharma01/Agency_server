import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import serviceRoutes from './service.routes.js';
import packageRoutes from './package.routes.js';
import faqRoutes from './faq.routes.js';
import portfolioRoutes from './portfolio.routes.js';
import blogRoutes from './blog.routes.js';
import teamMemberRoutes from './teamMember.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import leadRoutes from './lead.routes.js';
import mediaRoutes from './media.routes.js';
import settingRoutes from './setting.routes.js';

const router = Router();

/**
 * API v1 Route Aggregator.
 * Mounts all module routes under their respective prefixes.
 */
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/packages', packageRoutes);
router.use('/faqs', faqRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/blogs', blogRoutes);
router.use('/team', teamMemberRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/leads', leadRoutes);
router.use('/media', mediaRoutes);
router.use('/settings', settingRoutes);

export default router;

