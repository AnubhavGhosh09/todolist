const express = require('express');
const taskController = require('../controllers/taskController');
const { validateObjectId, validateTaskBody } = require('../middlewares/validate');

const router = express.Router();

/**
 * /api/v1/tasks
 * - POST  create a task
 * - GET   list tasks (filters: status, priority, q, sort, page, limit)
 */
router
  .route('/')
  .get(taskController.listTasks)
  .post(validateTaskBody, taskController.createTask);

/**
 * GET /api/v1/tasks/search?q=keyword
 * Must be declared BEFORE /:id so "search" isn't treated as an id.
 */
router.get('/search', taskController.searchTasks);

/**
 * /api/v1/tasks/:id
 * - GET    single task
 * - PUT    full update
 * - PATCH  partial update (e.g. { "status": "completed" })
 * - DELETE remove task
 */
router
  .route('/:id')
  .all(validateObjectId)
  .get(taskController.getTaskById)
  .put(validateTaskBody, taskController.updateTaskFull)
  .patch(validateTaskBody, taskController.updateTaskPartial)
  .delete(taskController.deleteTask);

module.exports = router;
