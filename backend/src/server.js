require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`API running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
    });

    // close the server cleanly when it stops
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.on(signal, async () => {
        console.log(`\n${signal} received, shutting down...`);
        server.close(async () => {
          await disconnectDB();
          process.exit(0);
        });
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
