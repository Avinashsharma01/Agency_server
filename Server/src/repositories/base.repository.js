import mongoose from 'mongoose';
import QueryBuilder from '../utils/queryBuilder.js';
import { getPagination } from '../utils/pagination.js';
import ApiError from '../utils/ApiError.js';
import { MESSAGES } from '../constants/index.js';

/**
 * Base Repository class providing generic CRUD operations.
 * All module-specific repositories extend this class,
 * inheriting pagination, filtering, sorting, soft delete, and lean queries.
 *
 * @example
 * class UserRepository extends BaseRepository {
 *   constructor() {
 *     super(UserModel, ['name', 'email']);
 *   }
 *   // Add domain-specific methods here
 * }
 */
class BaseRepository {
  /**
   * @param {mongoose.Model} model - Mongoose model instance
   * @param {string[]} [searchableFields=[]] - Fields to include in text search
   */
  constructor(model, searchableFields = []) {
    this.model = model;
    this.searchableFields = searchableFields;
  }

  /**
   * Creates a new document.
   *
   * @param {object} data - Document data
   * @returns {Promise<Document>} Created document
   */
  async create(data) {
    const doc = await this.model.create(data);
    return doc;
  }

  /**
   * Finds a document by ID.
   *
   * @param {string} id - Document ObjectId
   * @param {object} [options={}] - Options { populate, select, lean }
   * @returns {Promise<Document|null>} Found document or null
   */
  async findById(id, options = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(MESSAGES.INVALID_ID);
    }

    let query = this.model.findById(id);

    if (options.populate) {
      query = query.populate(options.populate);
    }

    if (options.select) {
      query = query.select(options.select);
    }

    if (options.lean !== false) {
      query = query.lean();
    }

    return query.exec();
  }

  /**
   * Finds a single document matching a filter.
   *
   * @param {object} filter - MongoDB filter
   * @param {object} [options={}] - Options { populate, select, lean }
   * @returns {Promise<Document|null>} Found document or null
   */
  async findOne(filter, options = {}) {
    let query = this.model.findOne(filter);

    if (options.populate) {
      query = query.populate(options.populate);
    }

    if (options.select) {
      query = query.select(options.select);
    }

    if (options.lean !== false) {
      query = query.lean();
    }

    return query.exec();
  }

  /**
   * Finds all documents matching a filter (no pagination).
   *
   * @param {object} [filter={}] - MongoDB filter
   * @param {object} [options={}] - Options { populate, select, sort, lean }
   * @returns {Promise<Document[]>} Array of documents
   */
  async findAll(filter = {}, options = {}) {
    let query = this.model.find(filter);

    if (options.populate) {
      query = query.populate(options.populate);
    }

    if (options.select) {
      query = query.select(options.select);
    }

    if (options.sort) {
      query = query.sort(options.sort);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.lean !== false) {
      query = query.lean();
    }

    return query.exec();
  }

  /**
   * Alias for findAll.
   *
   * @param {object} [filter={}] - MongoDB filter
   * @param {object} [options={}] - Options { populate, select, sort, limit, lean }
   * @returns {Promise<Document[]>} Array of documents
   */
  async findMany(filter = {}, options = {}) {
    return this.findAll(filter, options);
  }

  /**
   * Finds documents with pagination, filtering, searching, and sorting.
   *
   * @param {object} reqQuery - Express req.query
   * @param {object} [baseFilter={}] - Base filter (e.g., { isDeleted: false })
   * @param {object} [options={}] - Options { populate, select }
   * @returns {Promise<{ data: Document[], pagination: object }>}
   */
  async findPaginated(reqQuery, baseFilter = {}, options = {}) {
    const defaultFilter = { isDeleted: { $ne: true }, ...baseFilter };
    const qb = new QueryBuilder(reqQuery, this.searchableFields);
    const filter = qb.buildFilter(defaultFilter);
    const sort = qb.buildSort();
    const select = qb.buildSelect();

    const totalItems = await this.model.countDocuments(filter);
    const pagination = getPagination(reqQuery, totalItems);

    let query = this.model
      .find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit);

    if (select) {
      query = query.select(select);
    }

    if (options.populate) {
      query = query.populate(options.populate);
    }

    if (options.lean !== false) {
      query = query.lean();
    }

    const data = await query.exec();

    return { data, pagination };
  }

  /**
   * Updates a document by ID.
   *
   * @param {string} id - Document ObjectId
   * @param {object} updateData - Fields to update
   * @param {object} [options={}] - Options { populate, select, lean, runValidators }
   * @returns {Promise<Document|null>} Updated document or null
   */
  async updateById(id, updateData, options = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(MESSAGES.INVALID_ID);
    }

    let query = this.model.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: options.runValidators !== false,
      }
    );

    if (options.populate) {
      query = query.populate(options.populate);
    }

    if (options.select) {
      query = query.select(options.select);
    }

    if (options.lean !== false) {
      query = query.lean();
    }

    return query.exec();
  }

  /**
   * Updates a single document matching a filter.
   *
   * @param {object} filter - MongoDB filter
   * @param {object} updateData - Fields to update
   * @param {object} [options={}] - Additional options
   * @returns {Promise<Document|null>} Updated document or null
   */
  async updateOne(filter, updateData, options = {}) {
    let query = this.model.findOneAndUpdate(
      filter,
      updateData,
      {
        new: true,
        runValidators: options.runValidators !== false,
        ...options,
      }
    );

    if (options.lean !== false) {
      query = query.lean();
    }

    return query.exec();
  }

  /**
   * Hard deletes a document by ID.
   *
   * @param {string} id - Document ObjectId
   * @returns {Promise<Document|null>} Deleted document or null
   */
  async deleteById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest(MESSAGES.INVALID_ID);
    }

    return this.model.findByIdAndDelete(id).lean().exec();
  }

  /**
   * Soft deletes a document by ID (sets isDeleted=true, deletedAt=now).
   *
   * @param {string} id - Document ObjectId
   * @returns {Promise<Document|null>} Soft-deleted document or null
   */
  async softDeleteById(id) {
    return this.updateById(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  /**
   * Alias for softDeleteById.
   *
   * @param {string} id - Document ObjectId
   * @returns {Promise<Document|null>}
   */
  async softDelete(id) {
    return this.softDeleteById(id);
  }

  /**
   * Restores a soft-deleted document.
   *
   * @param {string} id - Document ObjectId
   * @returns {Promise<Document|null>} Restored document or null
   */
  async restoreById(id) {
    return this.updateById(id, {
      isDeleted: false,
      deletedAt: null,
    });
  }

  /**
   * Alias for restoreById.
   *
   * @param {string} id - Document ObjectId
   * @returns {Promise<Document|null>}
   */
  async restore(id) {
    return this.restoreById(id);
  }

  /**
   * Counts documents matching a filter.
   *
   * @param {object} [filter={}] - MongoDB filter
   * @returns {Promise<number>} Count of matching documents
   */
  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  /**
   * Checks if a document exists matching a filter.
   *
   * @param {object} filter - MongoDB filter
   * @returns {Promise<boolean>} True if document exists
   */
  async exists(filter) {
    const doc = await this.model.exists(filter);
    return !!doc;
  }

  /**
   * Deletes multiple documents matching a filter.
   *
   * @param {object} filter - MongoDB filter
   * @returns {Promise<object>} Deletion result { deletedCount }
   */
  async deleteMany(filter) {
    return this.model.deleteMany(filter);
  }

  /**
   * Bulk inserts multiple documents.
   *
   * @param {object[]} documents - Array of document data
   * @returns {Promise<Document[]>} Array of created documents
   */
  async insertMany(documents) {
    return this.model.insertMany(documents);
  }

  /**
   * Runs an aggregation pipeline.
   *
   * @param {object[]} pipeline - MongoDB aggregation pipeline
   * @returns {Promise<object[]>} Aggregation result
   */
  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }
}

export default BaseRepository;
