/**
 * User role constants.
 * Maps role names to their string identifiers used in the database.
 */
const ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
});

/**
 * All available roles as an array (for validation).
 */
export const ROLE_LIST = Object.values(ROLES);

/**
 * Role hierarchy for permission checks.
 * Higher index = higher privilege.
 */
export const ROLE_HIERARCHY = Object.freeze({
  [ROLES.EDITOR]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.ADMIN]: 3,
});

export default ROLES;
