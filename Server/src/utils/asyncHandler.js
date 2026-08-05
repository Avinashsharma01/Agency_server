/**
 * Wraps an async Express route handler to automatically catch errors
 * and forward them to the global error handler via next().
 *
 * Eliminates the need for try/catch blocks in every controller method.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json(ApiResponse.ok(users));
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
