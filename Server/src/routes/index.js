import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import serviceRoutes from './service.routes.js';

const router = Router();

/**
 * API v1 Route Aggregator.
 * Mounts all module routes under their respective prefixes.
 * New module routes are added here as they are built.
 */
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);

// Phase 3+: Additional routes will be mounted here
// router.use('/categories', categoryRoutes);
// router.use('/services', serviceRoutes);
// router.use('/packages', packageRoutes);
// router.use('/faqs', faqRoutes);
// router.use('/portfolio', portfolioRoutes);
// router.use('/blogs', blogRoutes);
// router.use('/team', teamRoutes);
// router.use('/testimonials', testimonialRoutes);
// router.use('/leads', leadRoutes);
// router.use('/media', mediaRoutes);
// router.use('/settings', settingRoutes);

export default router;
