# 📦 To-Do List API (Node.js + Express + MongoDB)

RESTful backend for the To-Do List app, built with a **Route → Controller → Service → Model** structure.

## Quick start

```bash
npm install
cp .env.example .env   # set MONGODB_URI (Atlas or local)
npm run dev            # http://localhost:5000
```

No MongoDB installed? Use the in-memory option:

```bash
node scripts/dev-mongo.js            # keep this running, note the printed URI
MONGODB_URI=<printed-uri> npm run dev
```

## Tests

```bash
npm test
```

Runs 17 integration tests against an in-memory MongoDB (requires a one-time binary download on first run).

## Folder layout

```
src/
├── config/     # DB connection
├── models/     # Mongoose schema + validation
├── services/   # Business logic and DB access (no HTTP concerns)
├── controllers # Parse requests, call services, shape responses
├── routes/     # URL → controller mapping
├── middlewares # validate (body/ObjectId), notFound, errorHandler
└── utils/      # ApiError, asyncHandler
```

## Environment variables

| Variable      | Required | Description                                     |
| ------------- | -------- | ----------------------------------------------- |
| `MONGODB_URI` | ✅       | MongoDB connection string                       |
| `PORT`        | ❌       | Listen port (default 5000)                      |
| `CORS_ORIGIN` | ❌       | Allowed origins, comma-separated (empty = all)  |
| `NODE_ENV`    | ❌       | `production` hides error stacks                 |

See [../README.md](../README.md) for the full API reference and deployment guide.
