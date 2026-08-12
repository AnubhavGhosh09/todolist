import { useState } from 'react';
import { PRIORITIES, EMPTY_TASK } from '../constants';

/**
 * Used both for creating a task (initialValues = EMPTY_TASK)
 * and editing an existing one. In edit mode it renders as a
 * compact inline form row.
 */
export default function TaskForm({ initialValues = EMPTY_TASK, onSubmit, onCancel, submitting }) {
  const isEdit = Boolean(initialValues.id);
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required.';
    if (form.dueDate && new Date(form.dueDate) < new Date(new Date().toDateString())) {
      nextErrors.dueDate = 'Due date cannot be in the past.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      // Send an empty dueDate as undefined so it doesn't overwrite on partial update.
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    });
  };

  return (
    <form className={`task-form ${isEdit ? 'task-form-inline' : ''}`} onSubmit={handleSubmit} noValidate>
      {!isEdit && <h2 className="form-title">Add a new task</h2>}

      <div className="form-row">
        <label className="form-field form-field-title">
          <span className="field-label">Title *</span>
          <input
            type="text"
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Complete the Assignment"
            maxLength={200}
            autoFocus={!isEdit}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </label>

        <label className="form-field">
          <span className="field-label">Priority</span>
          <select value={form.priority} onChange={set('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span className="field-label">Due date</span>
          <input type="date" value={form.dueDate?.slice(0, 10) || ''} onChange={set('dueDate')} />
          {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
        </label>
      </div>

      <label className="form-field">
        <span className="field-label">Description</span>
        <textarea
          value={form.description}
          onChange={set('description')}
          placeholder="Optional details about this task"
          rows={isEdit ? 1 : 2}
          maxLength={2000}
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save' : 'Add Task'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
