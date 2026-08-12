import { useEffect, useState } from 'react';
import { STATUSES, PRIORITIES } from '../constants';

export default function Toolbar({ query, filters, sort, onQueryChange, onFilterChange, onSortChange }) {
  // Local input state so typing feels instant; the parent debounces the API call.
  const [input, setInput] = useState(query);

  useEffect(() => setInput(query), [query]);

  return (
    <div className="toolbar">
      <div className="search-box">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onQueryChange(e.target.value);
          }}
          placeholder="Search tasks by title or description…"
          aria-label="Search tasks"
        />
      </div>

      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => onSortChange(e.target.value)} aria-label="Sort tasks">
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="dueDate">Due date ↑</option>
          <option value="-dueDate">Due date ↓</option>
          <option value="priority">Priority</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>
    </div>
  );
}
