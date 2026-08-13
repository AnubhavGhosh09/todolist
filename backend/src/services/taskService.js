const Task = require('../models/Task');

// only take the fields we allow from the body, everything else is ignored.
// this way the client cannot sneak in extra fields.
function pickFields(body) {
  const allowed = ['title', 'description', 'status', 'priority', 'dueDate'];
  const picked = {};
  for (const field of allowed) {
    const value = body[field];
    if (value !== undefined && value !== '') picked[field] = value;
  }
  return picked;
}

// mongo stores the id as _id but we agreed to send id to the frontend.
// this helper works for both query results (.lean()) and saved documents.
function toJson(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, ...rest } = obj;
  return { ...rest, id: String(_id) };
}

// all the database work lives here. the controllers only call these
// functions and turn the result into a response.
const taskService = {
  // create a new task and return it
  async createTask(body) {
    const task = await Task.create(pickFields(body));
    return toJson(task);
  },

  // list tasks with optional filters, search, sorting and pagination
  async listTasks(query = {}) {
    const { status, priority, q, sort, page = 1, limit = 50 } = query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // $text search works because of the text index defined on the schema
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    // only these sort keys are allowed, so the query string cant inject
    // anything weird into the sort
    const sortKeys = {
      createdAt: { createdAt: 1 },
      '-createdAt': { createdAt: -1 },
      dueDate: { dueDate: 1 },
      '-dueDate': { dueDate: -1 },
      priority: { priority: 1 },
      title: { title: 1 },
    };
    const sortCriteria = sortKeys[sort] || sortKeys['-createdAt'];

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortCriteria).skip(skip).limit(limitNum).lean(),
      Task.countDocuments(filter),
    ]);

    return {
      tasks: tasks.map(toJson),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    };
  },

  // get one task, returns null if it doesnt exist
  async getTaskById(id) {
    const task = await Task.findById(id).lean();
    return task ? toJson(task) : null;
  },

  // update a task, returns null if it doesnt exist
  async updateTask(id, body) {
    const updates = pickFields(body);
    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    return task ? toJson(task) : null;
  },

  // delete a task, returns the deleted task or null
  async deleteTask(id) {
    return Task.findByIdAndDelete(id).lean();
  },
};

module.exports = taskService;
