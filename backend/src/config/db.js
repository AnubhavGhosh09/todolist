const mongoose = require('mongoose');

//Connection to mongodb
async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Copy .env.example to .env and add your connection string.'
    );
  }

  mongoose.connection.on('connected', () => console.log('Mongo connected'));
  mongoose.connection.on('error', (err) => console.error('Mongo error:', err.message));
  mongoose.connection.on('disconnected', () => console.log('Mongo disconnected'));

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
