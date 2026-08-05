import mongoose from 'mongoose';
import 'dotenv/config';
import connectDatabase, { disconnectDatabase } from '../../config/database.js';
import Role from '../../models/Role.model.js';
import { ROLE_LIST } from '../../constants/index.js';
import logger from '../../utils/logger.js';

/**
 * Seeds default roles into the database.
 * Skips roles that already exist (idempotent).
 *
 * Usage: node src/database/seeds/roleSeeder.js
 */
const seedRoles = async () => {
  try {
    await connectDatabase();

    logger.info('🌱 Seeding roles...');

    const roleDescriptions = {
      admin: 'Full system access. Can manage all resources, users, and settings.',
      manager: 'Can manage content, services, leads, and team members. Cannot manage users or settings.',
      editor: 'Can create and edit content such as blogs, portfolio, and media.',
    };

    let created = 0;
    let skipped = 0;

    for (const roleName of ROLE_LIST) {
      const exists = await Role.findOne({ name: roleName });

      if (exists) {
        logger.info(`  ⏩ Role '${roleName}' already exists — skipped`);
        skipped++;
        continue;
      }

      await Role.create({
        name: roleName,
        description: roleDescriptions[roleName] || '',
        isActive: true,
      });

      logger.info(`  ✅ Role '${roleName}' created`);
      created++;
    }

    logger.info(`\n🌱 Role seeding complete: ${created} created, ${skipped} skipped`);

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Role seeding failed: ${error.message}`);
    await disconnectDatabase();
    process.exit(1);
  }
};

seedRoles();
