const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');

const TASK_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];


const pickTaskFields = (body) =>
  TASK_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

//cut undefines values
const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''));


const taskService = {
  //create a new task
  async createTask(data) {
    const task = await Task.create(pickTaskFields(data));
    return task.toJSON();
  },

  //List tasks with optional filters, sorting, and pagination.
  async listTasks({ status, priority, q, sort, page = 1, limit = 50 } = {}) {
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Full-text search across title and description 
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    // whitelist of sort keys, so the query string cant mess with anything
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

  //get a single task by its ID. 
  async getTaskById(id) {
    const task = await Task.findById(id).lean();
    if (!task) throw ApiError.notFound('Task not found');
    return taskToJson(task);
  },

  //update a task by its ID. Supports both full (PUT) and partial (PATCH) updates.
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

  // deletes a task permanently
  async deleteTask(id) {
    const task = await Task.findByIdAndDelete(id);
    if (!task) throw ApiError.notFound('Task not found');
    return task._id;
  },
};

function taskToJson(task) {
  const { _id, ...rest } = task;
  return { ...rest, id: String(_id) };
}

module.exports = taskService;
