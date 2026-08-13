# To-Do List Frontend

This is the frontend of the To-Do List app. It is built with React, Vite and Axios. The state is managed with React hooks, useState and useEffect, in App.jsx. All the HTTP calls live in the Axios client, src/api/taskApi.js.

## Quick start

```bash
npm install
npm run dev
```

The app runs on http://localhost:5173. The Vite dev server proxies /api to http://localhost:5000, check vite.config.js. Because of that we don't need CORS configuration locally, just have the backend running.

## Production build

```bash
npm run build
```

This outputs to the dist folder. For production, tell the app where the API lives. Put VITE_API_URL in a .env file, see .env.example.

## Features

The app can create, read, update and delete tasks. There is a checkbox to complete or un-complete a task, and a dropdown for pending, in-progress and completed. The search is a debounced full-text search on title and description. You can filter and sort by status, priority and sort order. The UI has loading spinners, error banners, success toasts and an empty state. It is responsive, it works on mobile and desktop.

## Components

The api folder has taskApi.js, it has the Axios instance and all the API functions. In the components folder there is Toolbar.jsx for the search box, filters and sort, TaskForm.jsx for the add and edit form with validation, TaskList.jsx for the list container, TaskItem.jsx for a single task row, Loader.jsx for the spinner, and Alert.jsx for the error and success banners. App.jsx handles the state and the data fetching, constants.js has the status and priority enums, and index.css has the styles.

See the main README for the deployment instructions and the assignment write-up.
