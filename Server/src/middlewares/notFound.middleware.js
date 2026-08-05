import ApiError from '../utils/ApiError.js';
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';

/**
 * 404 Not Found handler for unmatched routes.
 * Must be mounted after all other routes.
 */
const notFoundHandler = (req, res, next) => {
  next(
    new ApiError(
      HTTP_STATUS.NOT_FOUND,
      `${MESSAGES.SERVER.NOT_FOUND}: ${req.method} ${req.originalUrl}`
    )
  );
};

export default notFoundHandler;
