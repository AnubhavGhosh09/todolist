const taskService = require('../services/taskService');
const asyncHandler = require('../utils/asyncHandler');

// Handlers for task-related endpoints
const taskController = {
  //POST
  createTask: asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  }),

  //GET
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

  //GET /api/v1/tasks/search?q=keyword

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

  //GET via id
  getTaskById: asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id);
    res.status(200).json({ success: true, data: task });
  }),

  //PUT
  updateTaskFull: asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body, { full: true });
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  }),

  //PATCH
  updateTaskPartial: asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  }),

  //DELETE
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
