# ✅ To-Do List App — Full-Stack (Node.js + Express + MongoDB + React)

A complete To-Do List application built in two parts:

- **Part 1 — Backend:** RESTful APIs using **Node.js, Express.js, and MongoDB**, organized with a clean **Route → Controller → Service → Model** structure, full validation, and centralized error handling.
- **Part 2 — Frontend:** A **React** (Vite) app integrated with the backend APIs via **Axios**, with dynamic UI updates, loading states, error messages, search, filters, and status management.

> The API design follows the endpoint plan from the earlier assignment (Assignment 7): `POST/GET /api/v1/tasks`, `GET /api/v1/tasks/:id`, `PUT/PATCH /api/v1/tasks/:id`, `DELETE /api/v1/tasks/:id`, plus a dedicated search endpoint.

---

## 📁 Project Structure

```
todo-app/
├── backend/                 # Part 1 — Express + MongoDB REST API
│   ├── src/
│   │   ├── config/db.js             # MongoDB connection
│   │   ├── models/Task.js           # Mongoose schema (validation, enums, text index)
│   │   ├── services/taskService.js  # Business logic + DB access
│   │   ├── controllers/             # Thin HTTP adapters
│   │   ├── routes/                  # /api/v1 route definitions
│   │   ├── middlewares/             # validate, notFound, errorHandler
│   │   ├── utils/                   # ApiError, asyncHandler
│   │   ├── app.js                   # Express app
│   │   └── server.js                # Entry point
│   ├── tests/                       # Integration tests (in-memory MongoDB)
│   ├── scripts/dev-mongo.js         # Run an in-memory Mongo for local dev
│   ├── .env.example
│   └── package.json
├── frontend/                # Part 2 — React (Vite) + Axios
│   ├── src/
│   │   ├── api/taskApi.js           # Axios client (all HTTP calls)
│   │   ├── components/              # Toolbar, TaskForm, TaskList, TaskItem, Loader, Alert
│   │   ├── App.jsx                  # State management + orchestration
│   │   ├── constants.js
│   │   └── index.css
│   ├── vite.config.js               # Dev proxy → backend
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18+** (tested on v20)
- A MongoDB database — **MongoDB Atlas** (free tier) or local MongoDB
- npm

> No MongoDB installed? The repo includes `backend/scripts/dev-mongo.js`, which spins up an **in-memory MongoDB** (no installation) so you can develop and test without Atlas.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGODB_URI
npm run dev               # starts on http://localhost:5000
```

Or without installing MongoDB (in-memory database):

```bash
cd backend
node scripts/dev-mongo.js             # prints an in-memory Mongo URI (keep running)
# in another terminal:
MONGODB_URI=<the printed uri> npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:5000`, so no CORS setup is needed locally. Open **http://localhost:5173**.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable      | Description                                                              | Example                                            |
| ------------- | ------------------------------------------------------------------------ | -------------------------------------------------- |
| `MONGODB_URI` | MongoDB connection string (required)                                     | `mongodb+srv://user:pass@cluster.mongodb.net/todo` |
| `PORT`        | Port the API listens on (Render sets this automatically)                 | `5000`                                             |
| `CORS_ORIGIN` | Comma-separated allowed origins. Empty = allow all (dev).                | `https://todo-app.netlify.app`                     |
| `NODE_ENV`    | `development` / `production` (hides error stacks in production)          | `production`                                       |

### Frontend (`frontend/.env`)

| Variable       | Description                                                              | Example                                          |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| `VITE_API_URL` | Absolute backend API base URL for production builds. Leave unset in dev. | `https://todo-api.onrender.com/api/v1`           |

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint                  | Description                                         |
| ------ | ------------------------- | --------------------------------------------------- |
| POST   | `/tasks`                  | Create a task (201)                                 |
| GET    | `/tasks`                  | List tasks with filters                             |
| GET    | `/tasks/search?q=...`     | Full-text search across title + description         |
| GET    | `/tasks/:id`              | Get a single task                                   |
| PUT    | `/tasks/:id`              | Full update (requires `title`)                      |
| PATCH  | `/tasks/:id`              | Partial update — e.g. `{ "status": "completed" }`   |
| DELETE | `/tasks/:id`              | Delete a task                                       |
| GET    | `/health`                 | Health check                                        |

**List filters:** `status` (`pending` | `in-progress` | `completed`), `priority` (`Low` | `Medium` | `High`), `q` (search), `sort` (`-createdAt`, `dueDate`, `-dueDate`, `priority`, `title`), `page`, `limit`.

**Example — create a task:**

```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Complete the Assignment","description":"Build the API","priority":"High","dueDate":"2030-08-20T18:00:00.000Z"}'
```

**Example — update status:**

```bash
curl -X PATCH http://localhost:5000/api/v1/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

Responses follow the shape planned in the earlier assignment: `{ success, message?, count?, data }`, and tasks expose `id` (never `_id`).

---

## ✅ Testing

```bash
cd backend
npm test
```

17 integration tests run against a real (in-memory) MongoDB, covering create, validation errors, list/filters, search, single get, 404s, status updates, PUT vs PATCH semantics, delete, invalid ObjectIds, and unknown routes. You can also test interactively with **Postman** using the endpoints above.

```bash
cd frontend
npm run build      # verifies the production build compiles
```

---

## 🌍 Deployment

### Backend → Render (free tier)

1. Push the repo to GitHub.
2. In Render, create a **New Web Service**, connect the repo, set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add the environment variables from `backend/.env`:
   - `MONGODB_URI` (your Atlas connection string)
   - `CORS_ORIGIN=https://<your-frontend>.netlify.app`
   - `NODE_ENV=production`
4. Deploy. The API will be at `https://<your-service>.onrender.com`.

### Frontend → Netlify

1. In Netlify, **Add new site → Import an existing project**, connect the repo.
2. Set:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add the environment variable:
   - `VITE_API_URL=https://<your-service>.onrender.com/api/v1`
4. Deploy. The app will be at `https://<your-app>.netlify.app`.

> If you need the deployed app to be reachable from the Preview environment, add the deployed Netlify URL to `CORS_ORIGIN` on the backend.

---

## 🧩 Challenges Faced & How They Were Solved

**1. Cross-Origin Resource Sharing (CORS).** A React app on `localhost:5173` (or Netlify) calling Express on a different origin triggers CORS. *Solution:* `cors` middleware with a configurable `CORS_ORIGIN`, plus a Vite dev proxy so local development is same-origin (no CORS at all).

**2. Testing without a local MongoDB installation.** No `mongod` binary was available on the dev machine. *Solution:* `mongodb-memory-server` runs a real MongoDB in-memory for tests and local development. This surfaced a machine-specific gotcha — the Linux distro was misdetected (`VERSION_ID=7.3` looked like Debian 7, whose builds no longer exist), so the binary download 403'd. *Fix:* pin `MONGOMS_VERSION` + `MONGOMS_DISTRO=debian-12` explicitly.

**3. Search index disappearing.** Full-text search (`$text`) failed after test teardown because dropping the database also dropped the MongoDB text index. *Solution:* recreate indexes after reset (`Task.syncIndexes()`); in production Mongoose builds the index automatically on startup.

**4. Clean `id` in responses.** The planned API spec exposes `id`, but MongoDB stores `_id`. *Solution:* a Mongoose `toJSON` transform maps `_id → id` so every response matches the agreed contract.

**5. Frontend/backend data sync.** After any mutation, stale lists could show wrong data. *Solution:* every create/update/delete re-fetches from the server, and search/filter inputs are **debounced** (350 ms) to avoid hammering the API.

**6. Dangerous delete UX.** A plain delete button risks accidental data loss. *Solution:* a two-step confirm ("Delete" → "Sure?"), a 5-second window, and cancel on mouse-leave.

---

## 📚 Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Backend  | Node.js, Express 4, Mongoose 8, MongoDB         |
| Frontend | React 18, Vite 5, Axios                         |
| Testing  | Node test runner, mongodb-memory-server         |
| Hosting  | Render (API), Netlify (frontend)                |
