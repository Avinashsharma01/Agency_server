import connectDatabase, { disconnectDatabase } from '../../config/database.js';
import { seedRoles } from './roleSeeder.js';
import { seedDemoData } from './demoSeeder.js';
import User from '../../models/User.model.js';
import Role from '../../models/Role.model.js';
import config from '../../config/index.js';
import { ROLES } from '../../constants/index.js';
import logger from '../../utils/logger.js';

/**
 * Master Database Seeder.
 * Runs roleSeeder, adminSeeder, and demoSeeder sequentially.
 */
const runAllSeeders = async () => {
  try {
    await connectDatabase();
    logger.info('🌱 Starting Master Database Seeder...\n');

    // 1. Seed Roles
    logger.info('1️⃣  Seeding Roles...');
    await seedRoles();

    // 2. Seed Admin
    logger.info('\n2️⃣  Seeding Admin User...');
    const existingAdmin = await User.findOne({ email: config.seed.adminEmail });
    if (!existingAdmin) {
      const adminRole = await Role.findOne({ name: ROLES.ADMIN });
      if (adminRole) {
        await User.create({
          name: config.seed.adminName,
          email: config.seed.adminEmail,
          password: config.seed.adminPassword,
          role: adminRole._id,
          isActive: true,
        });
        logger.info(`  ✅ Admin user '${config.seed.adminEmail}' created.`);
      }
    } else {
      logger.info(`  ⏩ Admin user '${config.seed.adminEmail}' already exists.`);
    }

    // 3. Seed Demo Data
    logger.info('\n3️⃣  Seeding Demo Content...');
    await seedDemoData();

    logger.info('\n✨ Master database seeding completed successfully!');
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Master seeding failed: ${error.message}`);
    await disconnectDatabase();
    process.exit(1);
  }
};

runAllSeeders();
