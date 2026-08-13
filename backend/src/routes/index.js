const express = require('express');
const taskRoutes = require('./taskRoutes');

const router = express.Router();

// health check so we can easily see if the api is up
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

router.use('/tasks', taskRoutes);

module.exports = router;
