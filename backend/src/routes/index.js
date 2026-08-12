const express = require('express');
const taskRoutes = require('./taskRoutes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok' });
});

router.use('/tasks', taskRoutes);

module.exports = router;
