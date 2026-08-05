/**
 * Generates a URL-safe slug from a given string.
 * Handles special characters, multiple spaces, and unicode.
 *
 * @param {string} text - The string to slugify
 * @returns {string} URL-safe slug
 *
 * @example
 * slugify('Hello World!'); // 'hello-world'
 * slugify('  Web Design & Development  '); // 'web-design-and-development'
 * slugify('React.js Development'); // 'reactjs-development'
 */
export const slugify = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')           // Replace & with 'and'
    .replace(/[^\w\s-]/g, '')       // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-+/, '')             // Trim leading hyphens
    .replace(/-+$/, '');            // Trim trailing hyphens
};

/**
 * Generates a unique slug by appending a short suffix if needed.
 * Used when the base slug already exists in the database.
 *
 * @param {string} baseSlug - The base slug to make unique
 * @returns {string} Unique slug with random suffix
 *
 * @example
 * generateUniqueSlug('web-design'); // 'web-design-a3f2b1'
 */
export const generateUniqueSlug = (baseSlug) => {
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${suffix}`;
};

export default slugify;
