const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

/** Whitelist of fields that can be created/updated via the API. */
const TASK_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];

/** Pick only allowed fields from a raw request body. */
const pickTaskFields = (body) =>
  TASK_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

/** Strip empty/undefined values so they never clobber existing data. */
const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''));

/**
 * Service layer — all database access and business rules live here.
 * Controllers stay thin: they only translate HTTP concerns.
 */
const taskService = {
  /**
   * Create a new task.
   * @returns {Promise<import('mongoose').Document>}
   */
  async createTask(data) {
    const task = await Task.create(pickTaskFields(data));
    return task.toJSON();
  },

  /**
   * List tasks with optional filtering, search, sorting, and pagination.
   * Query params: status, priority, q (full-text search), sort, page, limit.
   */
  async listTasks({ status, priority, q, sort, page = 1, limit = 50 } = {}) {
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Full-text search across title + description (MongoDB text index).
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Whitelisted sort keys prevent query-string injection.
    const sortMap = {
      createdAt: { createdAt: 1 },
      '-createdAt': { createdAt: -1 },
      dueDate: { dueDate: 1 },
      '-dueDate': { dueDate: -1 },
      priority: { priority: 1 },
      title: { title: 1 },
    };
    const sortCriteria = sortMap[sort] || sortMap['-createdAt'];

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortCriteria).skip(skip).limit(limitNum).lean(),
      Task.countDocuments(filter),
    ]);

    return {
      tasks: tasks.map((t) => taskToJson(t)),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    };
  },

  /** Get a single task by id. */
  async getTaskById(id) {
    const task = await Task.findById(id).lean();
    if (!task) throw ApiError.notFound('Task not found');
    return taskToJson(task);
  },

  /**
   * Update a task. Supports both partial (PATCH) and full (PUT) updates —
   * PUT requires a title, PATCH updates only the fields provided.
   */
  async updateTask(id, data, { full = false } = {}) {
    const updates = pickTaskFields(data);

    if (full && updates.title === undefined) {
      throw ApiError.badRequest('Title is required for a full update (PUT)');
    }

    const task = await Task.findByIdAndUpdate(id, clean(updates), {
      new: true,
      runValidators: true,
    });

    if (!task) throw ApiError.notFound('Task not found');
    return task.toJSON();
  },

  /** Permanently delete a task. Returns the deleted task's id. */
  async deleteTask(id) {
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw ApiError.notFound('Task not found');
    return task._id;
  },
};

/** Convert a lean/plain task document to the API shape (id instead of _id). */
function taskToJson(task) {
  const { _id, ...rest } = task;
  return { ...rest, id: String(_id) };
}

module.exports = taskService;
