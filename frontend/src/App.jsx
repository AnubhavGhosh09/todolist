import { useCallback, useEffect, useRef, useState } from 'react';
import taskApi from './api/taskApi';
import Toolbar from './components/Toolbar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Loader from './components/Loader';
import Alert from './components/Alert';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [sort, setSort] = useState('-createdAt');
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null); // id of the task currently being updated
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');

  const debounceRef = useRef();

  // fetch tasks with the current search and filters, debounced
  const loadTasks = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await taskApi.list({
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        q: query.trim() || undefined,
        sort,
        ...params,
      });
      setTasks(data.data);
    } catch (err) {
      setError(err.displayMessage || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [query, filters.status, filters.priority, sort]);

  //debounce so we dont hit the server on every keystroke
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadTasks(), 350);
    return () => clearTimeout(debounceRef.current);
  }, [loadTasks]);

  // runs a request and keeps the id of the task being updated,
  // so its buttons stay disabled until the request finishes
  const runWithBusy = async (id, fn) => {
    setBusyId(id);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.displayMessage || 'Request failed.');
    } finally {
      setBusyId(null);
    }
  };

  // create a task
  const handleCreate = async (data) => {
    setCreating(true);
    setError('');
    try {
      await taskApi.create(data);
      setNotice('Task created successfully 🎉');
      await loadTasks();
    } catch (err) {
      setError(err.displayMessage || 'Failed to create task.');
    } finally {
      setCreating(false);
    }
  };

  // edit a task
  const handleEditSubmit = (task) =>
    runWithBusy(task.id, async () => {
      await taskApi.update(task.id, task);
      setEditingId(null);
      setNotice('Task updated.');
      await loadTasks();
    });

  // change the status of a task
  const handleStatusChange = (task, status) =>
    runWithBusy(task.id, async () => {
      await taskApi.update(task.id, { status });
      await loadTasks();
    });

  const handleToggleStatus = (task) =>
    handleStatusChange(task, task.status === 'completed' ? 'pending' : 'completed');

  // delete a task
  const handleDelete = (task) =>
    runWithBusy(task.id, async () => {
      await taskApi.remove(task.id);
      setNotice('Task deleted.');
      await loadTasks();
    });

  const handleQueryChange = (q) => setQuery(q);
  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  //hide the notice after a few seconds
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>✅ My To-Do List</h1>
        <p className="tagline">Plan your day, one task at a time.</p>
      </header>

      <main className="container">
        <Alert type="error" message={error} onDismiss={() => setError('')} />
        <Alert type="success" message={notice} onDismiss={() => setNotice('')} />

        <Toolbar
          query={query}
          filters={filters}
          sort={sort}
          onQueryChange={handleQueryChange}
          onFilterChange={handleFilterChange}
          onSortChange={setSort}
        />

        <section className="card">
          <TaskForm onSubmit={handleCreate} submitting={creating} />
        </section>

        <section className="card">
          <div className="list-header">
            <h2>Tasks</h2>
            {!loading && tasks.length > 0 && (
              <span className="stats">
                {tasks.length} task{tasks.length === 1 ? '' : 's'} · {completedCount} done
              </span>
            )}
          </div>

          {loading ? (
            <Loader label="Loading tasks…" />
          ) : (
            <TaskList
              tasks={tasks}
              loading={loading}
              editingId={editingId}
              onStartEdit={(task) => {
                setEditingId(task.id);
                setError('');
              }}
              onCancelEdit={() => setEditingId(null)}
              onSubmitEdit={handleEditSubmit}
              onToggleStatus={handleToggleStatus}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              busyId={busyId}
            />
          )}
        </section>
      </main>

      <footer className="app-footer">
        Built with React + Express + MongoDB ·{' '}
        <a href="/api/v1" target="_blank" rel="noreferrer">
          API docs
        </a>
      </footer>
    </div>
  );
}
