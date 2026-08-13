# To-Do List App

This is our full-stack assignment. We built a to-do app using Node.js, Express, MongoDB, and React. The app can add tasks, update them, delete them, and search through them.

We divided the work into two parts. The backend is made with Express and MongoDB, it handles all the task logic and the API. The frontend is made with React and Vite, it has the UI and connects to the backend.

For the API we followed the plan from class. We have POST and GET on /api/v1/tasks, GET, PUT and PATCH on /api/v1/tasks/:id, DELETE on /api/v1/tasks/:id, and a search endpoint too.

## Project structure

The project has two main folders. The backend folder has the Express server with the config, models, services, controllers, routes, middlewares and utils, plus the tests and a script that starts an in-memory MongoDB. The frontend folder has the React app with the API client, the components, App.jsx, the constants and the css file.

## Getting started

First you need Node.js 18 or newer, and MongoDB, either Atlas or installed locally. If you don't have MongoDB installed, the backend has a script that starts an in-memory MongoDB for you.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

This runs the backend on http://localhost:5000.

If you don't want to install MongoDB locally, you can do this instead:

```bash
cd backend
node scripts/dev-mongo.js
# then in another terminal:
MONGODB_URI=<the printed uri> npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on http://localhost:5173. The Vite dev server proxies /api to the backend, so we don't have to mess with CORS during local development.

## Environment variables

For the backend, the .env file needs MONGODB_URI, that is the MongoDB connection string. There is also PORT for the API port, CORS_ORIGIN for the allowed origins, and NODE_ENV for dev or production mode.

For the frontend, the .env file has VITE_API_URL, it is the backend API URL used in production.

## API reference

The base URL is http://localhost:5000/api/v1. You can POST to /tasks to create a task, GET /tasks to get all tasks with filters, GET /tasks/search?q=... to search, GET /tasks/:id to get one task, PUT or PATCH /tasks/:id to update a task, and DELETE /tasks/:id to delete one. There is also GET /health to check if the API is running.

For the list endpoint you can use these filters: status, priority, q, sort, page, limit.

Here is an example of creating a task:

```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Complete the Assignment","description":"Build the API","priority":"High","dueDate":"2030-08-20T18:00:00.000Z"}'
```

And here is an example of updating the status:

```bash
curl -X PATCH http://localhost:5000/api/v1/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

The responses follow the format we agreed on in class, { success, message?, count?, data }, and the task object uses id instead of _id.

## Testing

To run the tests, go to the backend folder and run npm test. There are 17 tests in total. They cover creating tasks, validation errors, list and search filters, getting a task by ID, 404s, updates, delete requests, invalid ObjectIds, and unknown routes. We also ran the frontend build just to make sure it compiles properly.

```bash
cd frontend
npm run build
```

## Deployment

For the backend on Render, first push the project to GitHub. Then create a new web service in Render, set the root directory to backend, use npm install for the build command and npm start for the start command, add the env variables from the backend .env file, and deploy.

For the frontend on Netlify, create a new site and import the repo. Set the base directory to frontend, build command is npm run build, publish directory is dist, add the VITE_API_URL env variable, and deploy.

## Problems we faced

### CORS issues

The frontend runs on a different port than the backend, so we got CORS errors. We fixed it with the cors middleware, a config variable for allowed origins, and the Vite proxy for local dev.

### No MongoDB installed locally

There was no MongoDB on the machine at first. To fix that we used mongodb-memory-server, it runs a real in-memory MongoDB that works for tests and local development.

### Search index disappearing

The full-text search broke after the tests because dropping the database also removed the text index. We fixed it by recreating the index after reset, it was kind of annoying but manageable.

### Response format mismatch

MongoDB stores _id but the API design wanted id in the response. We solved that with a Mongoose transform so the output looked the way we wanted.

### Stale frontend data

Sometimes the list on the frontend would not update right away after a task changed. We fixed it by refetching the data after every mutation and adding a small debounce for the search and filter inputs.

### Delete button being too dangerous

A plain delete button can lead to accidental deletes. We added a two-step confirm so the user has to actually confirm before the task is removed.

## Tech stack

We used Node.js, Express, Mongoose and MongoDB for the backend, React, Vite and Axios for the frontend, the Node test runner and mongodb-memory-server for testing, and Render and Netlify for hosting.

Overall this was a pretty good project. It combined backend, frontend, database and deployment stuff in one app. It took a while to debug everything, but in the end it worked and we got a decent full-stack project done.

## Note about AI help

Some parts of this project were built with the help of AI tools, especially the backend error handling, the validation logic and the tests. After getting that help I went through the code, simplified the parts I did not fully understand, and added comments, so I can explain how everything works. I am ready to walk through any file in the review meeting. See backend/ARCHITECTURE.md for a plain explanation of how the backend is put together.
