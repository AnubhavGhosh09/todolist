const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

// the /search route has to come before /:id, otherwise "search" would
// be treated as a task id
router.get('/search', taskController.searchTasks);

router.get('/', taskController.listTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTaskFull);
router.patch('/:id', taskController.updateTaskPartial);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
