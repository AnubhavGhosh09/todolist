const taskService = require('../services/taskService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Controllers are thin HTTP adapters: parse the request, call the
 * service, and shape the response. All business logic lives in the service.
 */
const taskController = {
  /** POST /api/v1/tasks */
  createTask: asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  }),

  /** GET /api/v1/tasks */
  listTasks: asyncHandler(async (req, res) => {
    const result = await taskService.listTasks(req.query);
    res.status(200).json({
      success: true,
      count: result.tasks.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.tasks,
    });
  }),

  /** GET /api/v1/tasks/search?q=keyword */
  searchTasks: asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required',
      });
    }
    const result = await taskService.listTasks({ ...req.query, q });
    res.status(200).json({
      success: true,
      count: result.tasks.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.tasks,
    });
  }),

  /** GET /api/v1/tasks/:id */
  getTaskById: asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id);
    res.status(200).json({ success: true, data: task });
  }),

  /** PUT /api/v1/tasks/:id — full update */
  updateTaskFull: asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body, { full: true });
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  }),

  /** PATCH /api/v1/tasks/:id — partial update (incl. status changes) */
  updateTaskPartial: asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  }),

  /** DELETE /api/v1/tasks/:id */
  deleteTask: asyncHandler(async (req, res) => {
    const id = await taskService.deleteTask(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      id,
    });
  }),
};

module.exports = taskController;
