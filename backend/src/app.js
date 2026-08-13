const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Trust proxy so Render/Netlify-style deployments report correct IPs.
app.set('trust proxy', 1);

// CORS: allow the React frontend (Vite dev server or Netlify) to call the API.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
          .map((s) => s.trim())
          // Browsers never send a trailing slash in the Origin header, so
          // strip it from configured origins to avoid silent mismatches.
          .map((s) => s.replace(/\/+$/, ''))
      : true, // reflect any origin when not configured (dev convenience)
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({
    name: 'To-Do List API',
    version: '1.0.0',
    endpoints: {
      'GET /api/v1/tasks': 'List tasks (filters: status, priority, q, sort, page, limit)',
      'POST /api/v1/tasks': 'Create a task',
      'GET /api/v1/tasks/search?q=': 'Search tasks by title/description',
      'GET /api/v1/tasks/:id': 'Get a single task',
      'PUT /api/v1/tasks/:id': 'Full update of a task',
      'PATCH /api/v1/tasks/:id': 'Partial update (e.g. status)',
      'DELETE /api/v1/tasks/:id': 'Delete a task',
      'GET /api/v1/health': 'Health check',
    },
  });
});

app.use('/api/v1', routes);

// 404 + centralized error handling.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
