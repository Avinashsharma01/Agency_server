import { PAGINATION } from '../constants/index.js';

/**
 * Calculates pagination metadata from query parameters.
 *
 * @param {object} query - Express req.query object
 * @param {number} totalItems - Total number of matching documents
 * @returns {object} Pagination config { page, limit, skip, totalItems, totalPages, hasNextPage, hasPrevPage }
 *
 * @example
 * const pagination = getPagination(req.query, 150);
 * // { page: 1, limit: 10, skip: 0, totalItems: 150, totalPages: 15, hasNextPage: true, hasPrevPage: false }
 */
export const getPagination = (query, totalItems) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    page,
    limit,
    skip,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export default getPagination;
