import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS, MESSAGES } from '../constants/index.js';

/**
 * Zod validation middleware factory.
 * Validates request body, query, and/or params against a Zod schema.
 *
 * @param {object} schemas - Object containing Zod schemas for { body, query, params }
 * @returns {Function} Express middleware
 *
 * @example
 * router.post('/users', validate({ body: createUserSchema }), controller.create);
 * router.get('/users/:id', validate({ params: idParamSchema }), controller.getById);
 */
const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }

    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }

    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(
        new ApiError(
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          MESSAGES.VALIDATION.FAILED,
          errors
        )
      );
    }

    next(error);
  }
};

export default validate;
