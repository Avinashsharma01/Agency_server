import connectDatabase, { disconnectDatabase } from '../../config/database.js';
import Role from '../../models/Role.model.js';
import { ROLE_LIST } from '../../constants/index.js';
import logger from '../../utils/logger.js';

/**
 * Seeds default roles into the database.
 * Skips roles that already exist (idempotent).
 */
export const seedRoles = async () => {
  logger.info('🌱 Seeding roles...');

  const roleDescriptions = {
    super_admin: 'Full root access to all platform resources.',
    admin: 'Full system access. Can manage all resources, users, and settings.',
    manager: 'Can manage content, services, leads, and team members.',
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

  logger.info(`  🌱 Role seeding complete: ${created} created, ${skipped} skipped`);
};

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  connectDatabase()
    .then(() => seedRoles())
    .then(() => disconnectDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`❌ Role seeding failed: ${err.message}`);
      process.exit(1);
    });
}
