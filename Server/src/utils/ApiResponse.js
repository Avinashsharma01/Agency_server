/**
 * Standardized API response wrapper.
 * Ensures all API responses follow a consistent JSON structure.
 *
 * @example
 * res.status(200).json(new ApiResponse(200, data, 'Users fetched'));
 * res.status(201).json(ApiResponse.created(data, 'User created'));
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response payload
   * @param {string} message - Human-readable message
   * @param {object} [meta=null] - Optional metadata (pagination, etc.)
   */
  constructor(statusCode, data = null, message = 'Success', meta = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (meta) {
      this.meta = meta;
    }
  }

  /**
   * Factory: 200 OK
   */
  static ok(data, message = 'Success', meta = null) {
    return new ApiResponse(200, data, message, meta);
  }

  /**
   * Factory: 201 Created
   */
  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  /**
   * Factory: 204 No Content (returns minimal response)
   */
  static noContent(message = 'Operation completed successfully') {
    return new ApiResponse(204, null, message);
  }

  /**
   * Factory: Paginated list response
   * @param {Array} data - Array of items
   * @param {object} pagination - Pagination metadata
   * @param {string} message - Response message
   */
  static paginated(data, pagination, message = 'Resources fetched successfully') {
    return new ApiResponse(200, data, message, { pagination });
  }
}

export default ApiResponse;
