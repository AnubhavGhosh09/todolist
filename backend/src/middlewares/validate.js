const ApiError = require('../utils/ApiError');

const STATUSES = ['pending', 'in-progress', 'completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

//validating the object id of the task
const validateObjectId = (req, _res, next) => {
  const { id } = req.params;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return next(ApiError.badRequest('Invalid task id format'));
  }
  return next();
};

//validating body of the task
const validateTaskBody = (req, _res, next) => {
  const errors = [];
  const { title, status, priority, dueDate } = req.body || {};

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    errors.push('title must be a non-empty string');
  } else if (title !== undefined && title.trim().length > 200) {
    errors.push('title cannot exceed 200 characters');
  }

  if (status !== undefined && !STATUSES.includes(status)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);
  }

  if (dueDate !== undefined) {
    const parsed = new Date(dueDate);
    if (Number.isNaN(parsed.getTime())) {
      errors.push('dueDate must be a valid date string');
    } else if (parsed.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
      errors.push('dueDate cannot be in the past');
    }
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed', errors));
  }
  return next();
};

module.exports = { validateObjectId, validateTaskBody };
