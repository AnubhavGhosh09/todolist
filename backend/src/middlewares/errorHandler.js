// this middleware catches errors thrown anywhere and turns them into a
// json response, so the client always gets something useful instead of a crash
module.exports = function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = 'Something went wrong';
  let details;

  // a bad id that mongoose cannot parse into an ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id format';
  }

  // schema validation errors (missing title, bad enum, past due date...)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  }

  // duplicate key error (code 11000), happens when a unique field repeats
  if (err.code === 11000) {
    statusCode = 409;
    message = 'A task with the same value already exists';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};
