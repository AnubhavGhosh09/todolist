const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

function formatMongooseErrors(error) {
  return Object.values(error.errors || {}).map((e) => e.message);
}

//for handling any kind of error that occurs in the application and sending a proper response to the client.
function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // for error where an id that isn't a valid ObjectId.
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid id format';
  }

  // error for missing title.
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
