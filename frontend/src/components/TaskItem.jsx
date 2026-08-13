import { useRef, useState } from 'react';
import { STATUSES } from '../constants';

function formatDueDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TaskItem({ task, onToggleStatus, onStatusChange, onEdit, onDelete, busy }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const confirmTimer = useRef(null);

  const cancelConfirm = () => {
    clearTimeout(confirmTimer.current);
    setConfirmingDelete(false);
  };

  // first click arms the confirm button, the second click really deletes.
  // if you do nothing for 5 seconds it goes back to normal
  const handleDelete = () => {
    if (confirmingDelete) {
      clearTimeout(confirmTimer.current);
      onDelete(task);
      return;
    }
    setConfirmingDelete(true);
    clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmingDelete(false), 5000);
  };

  const completed = task.status === 'completed';
  const due = formatDueDate(task.dueDate);
  const overdue = due && !completed && new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <li className={`task-item ${completed ? 'task-completed' : ''}`} data-priority={task.priority}>
      <div className="task-check">
        <input
          type="checkbox"
          checked={completed}
          onChange={() => onToggleStatus(task)}
          disabled={busy}
          aria-label={`Mark "${task.title}" ${completed ? 'not completed' : 'completed'}`}
        />
      </div>

      <div className="task-body">
        <div className="task-title-row">
          <span className="task-title">{task.title}</span>
          <span className={`badge badge-priority badge-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <select
            className="status-select"
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
            disabled={busy}
            aria-label={`Status of "${task.title}"`}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {due && (
            <span className={`due-date ${overdue ? 'due-overdue' : ''}`}>
              {overdue ? '⚠ Overdue: ' : 'Due: '}
              {due}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions" onMouseLeave={confirmingDelete ? cancelConfirm : undefined}>
        <button
          type="button"
          className="btn btn-small"
          onClick={() => onEdit(task)}
          disabled={busy}
        >
          Edit
        </button>
        <button
          type="button"
          className={`btn btn-small btn-danger ${confirmingDelete ? 'btn-confirm' : ''}`}
          onClick={handleDelete}
          disabled={busy}
          aria-label={confirmingDelete ? `Confirm deleting "${task.title}"` : `Delete "${task.title}"`}
        >
          {confirmingDelete ? 'Sure?' : 'Delete'}
        </button>
      </div>
    </li>
  );
}
