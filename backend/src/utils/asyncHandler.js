/**
 * Wraps an async route handler and forwards any rejection to the
 * Express error-handling middleware — no try/catch boilerplate in controllers.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
