import mongoose from 'mongoose';

/**
 * Builds MongoDB-compatible query objects from Express request query parameters.
 * Supports filtering, searching, sorting, and field selection.
 *
 * @example
 * // GET /api/v1/services?search=web&status=active&sort=-createdAt&fields=title,slug
 * const qb = new QueryBuilder(req.query, ['title', 'description']);
 * const filter = qb.buildFilter();
 * const sort = qb.buildSort();
 * const select = qb.buildSelect();
 */
class QueryBuilder {
  /**
   * @param {object} query - Express req.query
   * @param {string[]} [searchableFields=[]] - Fields to include in text search
   */
  constructor(query, searchableFields = []) {
    this.query = query;
    this.searchableFields = searchableFields;
  }

  /**
   * Builds a MongoDB filter object from query parameters.
   * Supports:
   * - Exact match: ?status=active
   * - Text search: ?search=keyword (searches across searchableFields)
   * - Comparison: ?price[gte]=100&price[lte]=500
   * - Boolean: ?featured=true
   * - Reference ID: ?category=<ObjectId>
   *
   * Reserved query params (page, limit, sort, fields, search) are excluded from filters.
   *
   * @param {object} [baseFilter={}] - Base filter to merge with (e.g., { isDeleted: false })
   * @returns {object} MongoDB filter object
   */
  buildFilter(baseFilter = {}) {
    const filter = { ...baseFilter };
    const excludedFields = ['page', 'limit', 'sort', 'fields', 'search'];

    // Text search across searchable fields
    if (this.query.search && this.searchableFields.length > 0) {
      const searchRegex = new RegExp(this.escapeRegex(this.query.search), 'i');
      filter.$or = this.searchableFields.map((field) => ({
        [field]: searchRegex,
      }));
    }

    // Process remaining query params as filters
    for (const [key, value] of Object.entries(this.query)) {
      if (excludedFields.includes(key)) continue;

      // Handle comparison operators: ?price[gte]=100
      if (typeof value === 'object' && value !== null) {
        const operators = {};
        for (const [op, val] of Object.entries(value)) {
          if (['gte', 'gt', 'lte', 'lt', 'ne'].includes(op)) {
            operators[`$${op}`] = isNaN(val) ? val : Number(val);
          }
        }
        if (Object.keys(operators).length > 0) {
          filter[key] = operators;
        }
        continue;
      }

      // Handle boolean values
      if (value === 'true' || value === 'false') {
        filter[key] = value === 'true';
        continue;
      }

      // Handle ObjectId references
      if (mongoose.Types.ObjectId.isValid(value)) {
        filter[key] = value;
        continue;
      }

      // Handle numeric values
      if (!isNaN(value) && value !== '') {
        filter[key] = Number(value);
        continue;
      }

      // Default: exact string match
      filter[key] = value;
    }

    return filter;
  }

  /**
   * Builds a MongoDB sort object from the `sort` query parameter.
   * Supports multiple sort fields separated by commas.
   * Prefix with `-` for descending order.
   *
   * @param {string} [defaultSort='-createdAt'] - Default sort if none provided
   * @returns {object} MongoDB sort object
   *
   * @example
   * // ?sort=-createdAt,title → { createdAt: -1, title: 1 }
   */
  buildSort(defaultSort = '-createdAt') {
    const sortString = this.query.sort || defaultSort;
    const sortObj = {};

    sortString.split(',').forEach((field) => {
      const trimmed = field.trim();
      if (trimmed.startsWith('-')) {
        sortObj[trimmed.substring(1)] = -1;
      } else {
        sortObj[trimmed] = 1;
      }
    });

    return sortObj;
  }

  /**
   * Builds a MongoDB field selection string from the `fields` query parameter.
   *
   * @param {string} [defaultFields=''] - Default field selection
   * @returns {string} Mongoose select string
   *
   * @example
   * // ?fields=title,slug,status → 'title slug status'
   */
  buildSelect(defaultFields = '') {
    if (!this.query.fields) return defaultFields;
    return this.query.fields.split(',').map((f) => f.trim()).join(' ');
  }

  /**
   * Escapes special regex characters in a string.
   * Prevents regex injection through search parameters.
   *
   * @param {string} str - String to escape
   * @returns {string} Escaped string safe for use in RegExp
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export default QueryBuilder;
