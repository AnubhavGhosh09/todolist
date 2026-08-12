# 🎨 To-Do List Frontend (React + Vite + Axios)

React frontend integrated with the To-Do List API. State is managed with React hooks (`useState` / `useEffect`) in `App.jsx`; all HTTP calls live in the Axios client (`src/api/taskApi.js`).

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:5000` (see `vite.config.js`), so no CORS configuration is needed locally — just have the backend running.

## Production build

```bash
npm run build          # outputs to dist/
```

For production, tell the app where the API lives:

```
# .env (see .env.example)
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

## Features

- **CRUD** — create, read, update, and delete tasks
- **Status updates** — checkbox to complete/un-complete, or a dropdown for `pending` / `in-progress` / `completed`
- **Search** — debounced full-text search across title and description
- **Filters & sorting** — by status, priority, and sort order
- **UX states** — loading spinner, error banners, success toasts, empty state
- **Responsive** — works on mobile and desktop

## Components

```
src/
├── api/taskApi.js       # Axios instance + all API functions + error normalization
├── components/
│   ├── Toolbar.jsx      # search box + filters + sort
│   ├── TaskForm.jsx     # add/edit form with validation
│   ├── TaskList.jsx     # list container (empty state, inline editing)
│   ├── TaskItem.jsx     # single task row (status, edit, two-step delete)
│   ├── Loader.jsx       # spinner
│   └── Alert.jsx        # error / success banners
├── App.jsx              # state management + data fetching orchestration
├── constants.js         # status/priority enums shared by the UI
└── index.css
```

See [../README.md](../README.md) for deployment instructions (Netlify) and the assignment write-up.
