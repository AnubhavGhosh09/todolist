# To-Do List API

This is the backend of the To-Do List app. It is built with Node.js, Express and MongoDB. The code follows a Route to Controller to Service to Model structure.

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Make sure to set MONGODB_URI in the .env file, it can be Atlas or local. The server runs on http://localhost:5000.

If you don't have MongoDB installed, you can run this script instead:

```bash
node scripts/dev-mongo.js
```

Keep it running and note the printed URI, then start the server with it:

```bash
MONGODB_URI=<printed-uri> npm run dev
```

## Tests

```bash
npm test
```

This runs 17 integration tests.

## Environment variables

MONGODB_URI is required, it is the MongoDB connection string. PORT is optional, it is the listen port and defaults to 5000. CORS_ORIGIN is optional, it is the allowed origins separated by commas, empty means all. NODE_ENV is optional, production hides the error stacks.
