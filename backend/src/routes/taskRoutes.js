const express = require('express');
const taskController = require('../controllers/taskController');
const { validateObjectId, validateTaskBody } = require('../middlewares/validate');

const router = express.Router();


router
  .route('/')
  .get(taskController.listTasks)
  .post(validateTaskBody, taskController.createTask);

router.get('/search', taskController.searchTasks);

// routes for /:id, GET a task, PUT full update, PATCH partial update, DELETE
router
  .route('/:id')
  .all(validateObjectId)
  .get(taskController.getTaskById)
  .put(validateTaskBody, taskController.updateTaskFull)
  .patch(validateTaskBody, taskController.updateTaskPartial)
  .delete(taskController.deleteTask);

module.exports = router;
