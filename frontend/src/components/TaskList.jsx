import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

export default function TaskList({
  tasks,
  loading,
  editingId,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onToggleStatus,
  onStatusChange,
  onDelete,
  busyId,
}) {
  if (loading) return null; // the parent renders a Loader while fetching

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon" aria-hidden="true">🗒️</span>
        <p className="empty-title">No tasks found</p>
        <p className="empty-hint">
          Add a task above, or adjust your search / filters to see more.
        </p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) =>
        task.id === editingId ? (
          <li key={task.id} className="task-item task-item-editing">
            <TaskForm
              initialValues={task}
              onSubmit={onSubmitEdit}
              onCancel={onCancelEdit}
              submitting={busyId === task.id}
            />
          </li>
        ) : (
          <TaskItem
            key={task.id}
            task={task}
            onToggleStatus={onToggleStatus}
            onStatusChange={onStatusChange}
            onEdit={onStartEdit}
            onDelete={onDelete}
            busy={busyId === task.id}
          />
        ),
      )}
    </ul>
  );
}
