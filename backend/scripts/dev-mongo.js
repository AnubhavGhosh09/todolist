//used before actual atlas connection is established, to avoid connection errors
process.env.MONGOMS_VERSION = '8.0.4';
process.env.MONGOMS_DISTRO = 'debian-12';

const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongo = await MongoMemoryServer.create();
  console.log('In-memory MongoDB ready at:');
  console.log(mongo.getUri());
  console.log('\nPress Ctrl+C to stop.');
})();
