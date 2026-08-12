const ApiError = require('../utils/ApiError');

/** 404 handler for unmatched routes. */
function notFound(_req, _res, next) {
  next(ApiError.notFound('Route not found'));
}

module.exports = notFound;
