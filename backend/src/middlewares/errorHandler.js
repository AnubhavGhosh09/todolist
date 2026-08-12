const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

/** Format a Mongoose validation error into readable messages. */
function formatMongooseErrors(error) {
  return Object.values(error.errors || {}).map((e) => e.message);
}

/**
 * Centralized error handler — the last middleware in the stack.
 * Converts every thrown error into a consistent JSON response.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Mongoose cast errors: an id that isn't a valid ObjectId.
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid id format';
  }

  // Mongoose validation errors (e.g. missing title, bad enum).
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = formatMongooseErrors(err);
  }

  // Duplicate key errors.
  if (err.code === 11000) {
    statusCode = 409;
    message = 'A task with the same value already exists';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
}

module.exports = errorHandler;
