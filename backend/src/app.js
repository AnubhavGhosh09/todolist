const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.set('trust proxy', 1);

// allow the react frontend to call the api from its own domain
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
          .map((s) => s.trim())
          // browsers never send a trailing slash in the Origin header,
          // so we strip it from the configured origins to match
          .map((s) => s.replace(/\/+$/, ''))
      : true,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// simple info at the root so we can see the api is up
app.get('/', (req, res) => {
  res.json({ name: 'To-Do List API', version: '1.0.0' });
});

app.use('/api/v1', routes);

// 404 for anything that doesnt match a route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// this has to be last, it handles all the errors from the routes above
app.use(errorHandler);

module.exports = app;
