import mongoose from 'mongoose';
import 'dotenv/config';
import connectDatabase, { disconnectDatabase } from '../../config/database.js';
import User from '../../models/User.model.js';
import Role from '../../models/Role.model.js';
import config from '../../config/index.js';
import { ROLES } from '../../constants/index.js';
import logger from '../../utils/logger.js';

/**
 * Seeds the default super admin user.
 * Requires roles to be seeded first (run roleSeeder.js before this).
 * Skips if the admin email already exists (idempotent).
 *
 * Usage: node src/database/seeds/adminSeeder.js
 */
const seedAdmin = async () => {
  try {
    await connectDatabase();

    logger.info('🌱 Seeding super admin...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: config.seed.adminEmail });

    if (existingAdmin) {
      logger.info(`  ⏩ Admin user '${config.seed.adminEmail}' already exists — skipped`);
      await disconnectDatabase();
      process.exit(0);
    }

    // Find the admin role
    const adminRole = await Role.findOne({ name: ROLES.ADMIN });

    if (!adminRole) {
      logger.error('  ❌ Admin role not found. Please run role seeder first: npm run seed:roles');
      await disconnectDatabase();
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      name: config.seed.adminName,
      email: config.seed.adminEmail,
      password: config.seed.adminPassword,
      role: adminRole._id,
      isActive: true,
    });

    logger.info(`  ✅ Super admin created:`);
    logger.info(`     Name:  ${admin.name}`);
    logger.info(`     Email: ${admin.email}`);
    logger.info(`     Role:  admin`);
    logger.info(`\n  ⚠️  Change the default password immediately after first login!`);

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Admin seeding failed: ${error.message}`);
    await disconnectDatabase();
    process.exit(1);
  }
};

seedAdmin();
