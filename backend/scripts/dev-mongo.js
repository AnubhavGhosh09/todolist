/**
 * Development helper: starts an in-memory MongoDB (no installation needed)
 * and keeps it running so the API can be developed without Atlas.
 *
 * Usage:  node scripts/dev-mongo.js
 * Then:   MONGODB_URI=mongodb://127.0.0.1:27018/todo_app npm run dev
 */
process.env.MONGOMS_VERSION = '8.0.4';
process.env.MONGOMS_DISTRO = 'debian-12';

const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongo = await MongoMemoryServer.create();
  console.log('In-memory MongoDB ready at:');
  console.log(mongo.getUri());
  console.log('\nPress Ctrl+C to stop.');
})();
