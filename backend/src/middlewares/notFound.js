const ApiError = require('../utils/ApiError');

//for 404 error when a route is not found.
function notFound(_req, _res, next) {
  next(ApiError.notFound('Route not found'));
}

module.exports = notFound;
