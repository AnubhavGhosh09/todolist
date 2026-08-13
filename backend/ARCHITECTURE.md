# How the backend works (walkthrough for the review)

This file explains the backend in plain words, so I can defend it in the
follow-up meeting. If I understand these pages I can answer questions about
any part of the code.

## The flow of a request

Every request goes through the same layers, one after the other:

1. Routes (`src/routes`) - match the URL and call the right controller function.
2. Controllers (`src/controllers`) - read the request, validate the body, call
   the service, and send the response.
3. Services (`src/services`) - do the actual database work with Mongoose.
4. Model (`src/models/Task.js`) - defines the shape of a task and what data is valid.

Example: a client sends `POST /api/v1/tasks` with a JSON body like
`{ "title": "Finish the assignment", "priority": "High" }`.

- `routes/taskRoutes.js` has `router.post('/', taskController.createTask)`, so
  `createTask` runs.
- `createTask` validates the body (title, status, priority, dueDate). If
  something is wrong it returns a 400 with the list of errors and stops.
- If validation passes it calls `taskService.createTask(req.body)`.
- The service picks only the allowed fields from the body, calls
  `Task.create(...)`, and converts the saved document to JSON.
- The controller takes the result and sends back `201` with
  `{ success: true, message: "Task created successfully", data: task }`.

So the order is always: route picks the handler, the controller talks to the
HTTP side, the service talks to the database.

## Why this structure?

- Controllers stay small. They only worry about HTTP things: reading the
  request, choosing status codes, sending JSON.
- The database queries all live in the service. If we change how tasks are
  stored, we only touch `taskService.js` and nothing else breaks.
- The model is the single place that defines what a task IS (its fields and
  their rules), so the whole app agrees on the same shape.
- This way the frontend only ever talks to routes, and the routes never touch
  the database directly.

## Error handling

Express does not catch errors from `async` functions automatically, so every
controller function is wrapped in `try/catch`. When something fails we call
`next(err)`, which hands the error to the error handler middleware
(`src/middlewares/errorHandler.js`).

The error handler is the last middleware in `app.js`. It looks at the error
and picks a status code:

- `CastError` (mongoose cannot read the id) -> 400 "Invalid id format"
- `ValidationError` (schema rules failed) -> 400 "Validation failed" plus the
  list of messages from the schema
- duplicate key error (`code 11000`) -> 409
- anything else -> 500 "Something went wrong"

I do not use a custom error class anymore. The controllers check the common
cases themselves (bad id, task not found, validation errors) and send the
response directly, and the error handler only catches the unexpected stuff.

## Validation: why two layers?

Validation happens in two places on purpose:

1. In the controller (`validateBody`). This gives friendly, early error
   messages for the things clients usually get wrong: empty title, wrong
   status, wrong priority, past due date. The controller checks these and
   returns a 400 with a readable list.
2. In the mongoose schema. The database itself refuses bad data, even if
   someone calls the API with a completely different client that skips the
   controller validation. This is the safety net.

So the controller validation is for good error messages, and the schema
validation is for guaranteeing the data is never bad.

## Other pieces

- `config/db.js` connects to MongoDB. It reads `MONGODB_URI` from the
  environment, and logs when mongo connects or errors.
- `server.js` starts the server and closes it cleanly on `SIGINT`/`SIGTERM`
  (Ctrl+C, or when a hosting platform stops the app).
- The text index on the schema (`title`, `description`) is what makes the
  search endpoint work. `$text: { $search: q }` only works if that index
  exists. Tests drop the database, which removes the index, so the tests
  rebuild it with `Task.syncIndexes()`.
- `GET /api/v1/health` returns `{ success: true, status: "ok" }`, used to
  check the api is up.
- We send `id` (not `_id`) to the frontend. The `toJson` helper in the
  service renames `_id` to `id` before returning.

## Likely questions and answers

Q: Why does the service return `null` instead of throwing when a task is not
found?
A: I kept it simple. The controller checks the result and sends a 404 if it
is `null`. No custom error classes needed.

Q: Why not just call Mongoose from the controllers and skip the service?
A: Because then the controllers would mix HTTP logic with database logic.
Keeping the queries in the service means each file has one job, and if the
database code changes, the controllers do not.

Q: Why do you validate in both the controller and the schema?
A: The controller gives friendly messages for things the client gets wrong.
The schema is the last line of defense so bad data can never be saved even
if someone bypasses the API.

Q: What happens when someone sends an id that is not a valid ObjectId?
A: The controller checks it with a regex (`isValidId`) and returns 400 right
away. If it somehow slips through, mongoose throws a CastError and the error
handler turns that into a 400 too.

Q: Why is the `/search` route before the `/:id` route?
A: Because routes match in order. If `/:id` came first, the word "search"
would be treated as a task id and we would never reach the search handler.

Q: How does pagination work?
A: `page` and `limit` come from the query string. The service skips
`(page - 1) * limit` documents and takes `limit` of them, then returns the
total count and how many pages exist.

Q: Why the whitelist of sort keys?
A: The client sends the sort key in the query string. Instead of trusting it
directly, the service looks it up in a fixed map and falls back to
"newest first" if it is not there. This stops someone from injecting
arbitrary sort objects.
