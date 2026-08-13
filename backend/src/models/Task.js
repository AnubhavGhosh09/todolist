const mongoose = require('mongoose');

// schema for a task. the validators here make sure bad data never
// gets saved, even if someone skips the validation in the controller
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: 'Status must be one of: pending, in-progress, completed',
      },
      default: 'pending',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be one of: Low, Medium, High',
      },
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      validate: {
        validator(value) {
          return !value || value.getTime() >= Date.now() - 24 * 60 * 60 * 1000;
        },
        message: 'Due date cannot be in the past',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// text index so the search endpoint can look inside title and description
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);
