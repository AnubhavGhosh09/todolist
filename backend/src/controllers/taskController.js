const taskService = require('../services/taskService');

// checks if an id looks like a mongo object id (24 hex chars)
function isValidId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

// validates the fields the client sends and returns a list of error messages.
// I put this here instead of a separate middleware so its easier to follow.
function validateBody(body) {
  const errors = [];
  const { title, status, priority, dueDate } = body;

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    errors.push('title must be a non-empty string');
  } else if (title !== undefined && title.trim().length > 200) {
    errors.push('title cannot exceed 200 characters');
  }

  if (status !== undefined && !['pending', 'in-progress', 'completed'].includes(status)) {
    errors.push('status must be one of: pending, in-progress, completed');
  }

  if (priority !== undefined && !['Low', 'Medium', 'High'].includes(priority)) {
    errors.push('priority must be one of: Low, Medium, High');
  }

  if (dueDate !== undefined) {
    const parsed = new Date(dueDate);
    if (Number.isNaN(parsed.getTime())) {
      errors.push('dueDate must be a valid date string');
    } else if (parsed.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
      errors.push('dueDate cannot be in the past');
    }
  }

  return errors;
}

// simple 400 response used when validation fails
function badRequest(res, details) {
  return res.status(400).json({ success: false, message: 'Validation failed', details });
}

// simple 404 response used when a task is not found
function notFound(res) {
  return res.status(404).json({ success: false, message: 'Task not found' });
}

// every handler is wrapped in try/catch because async errors do not go to
// express automatically, so we call next(err) to reach the error handler
const taskController = {
  // POST /tasks - create a task
  async createTask(req, res, next) {
    try {
      const errors = validateBody(req.body);
      if (errors.length > 0) return badRequest(res, errors);

      const task = await taskService.createTask(req.body);
      res.status(201).json({ success: true, message: 'Task created successfully', data: task });
    } catch (err) {
      next(err);
    }
  },

  // GET /tasks - list tasks with filters
  async listTasks(req, res, next) {
    try {
      const result = await taskService.listTasks(req.query);
      res.json({
        success: true,
        count: result.tasks.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
        data: result.tasks,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /tasks/search?q=keyword - search by title/description
  async searchTasks(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || !q.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Search query parameter "q" is required',
        });
      }
      const result = await taskService.listTasks({ ...req.query, q });
      res.json({
        success: true,
        count: result.tasks.length,
        total: result.total,
        page: result.page,
        pages: result.pages,
        data: result.tasks,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /tasks/:id - get one task
  async getTaskById(req, res, next) {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid task id format' });
      }
      const task = await taskService.getTaskById(req.params.id);
      if (!task) return notFound(res);
      res.json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  },

  // PUT /tasks/:id - full update, title is required here
  async updateTaskFull(req, res, next) {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid task id format' });
      }
      const errors = validateBody(req.body);
      if (errors.length > 0) return badRequest(res, errors);
      if (!req.body.title || !req.body.title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title is required for a full update (PUT)',
        });
      }
      const task = await taskService.updateTask(req.params.id, req.body, { full: true });
      if (!task) return notFound(res);
      res.json({ success: true, message: 'Task updated successfully', data: task });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /tasks/:id - partial update, only sends the fields that changed
  async updateTaskPartial(req, res, next) {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid task id format' });
      }
      const errors = validateBody(req.body);
      if (errors.length > 0) return badRequest(res, errors);

      const task = await taskService.updateTask(req.params.id, req.body);
      if (!task) return notFound(res);
      res.json({ success: true, message: 'Task updated successfully', data: task });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /tasks/:id - remove a task
  async deleteTask(req, res, next) {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Invalid task id format' });
      }
      const task = await taskService.deleteTask(req.params.id);
      if (!task) return notFound(res);
      res.json({ success: true, message: 'Task deleted successfully', id: String(task._id) });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = taskController;
