import axios from 'axios';

// one axios instance for all the requests, the base url comes from VITE_API_URL
// if its set, otherwise /api/v1 which vite proxies to the backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

//turn backend errors into readable messages for the user
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.details;
    const message = error.response?.data?.message;
    if (Array.isArray(detail) && detail.length > 0) {
      error.displayMessage = detail.join(' • ');
    } else if (message) {
      error.displayMessage = message;
    } else if (error.code === 'ERR_NETWORK') {
      error.displayMessage =
        'Cannot reach the server. Is the backend running? (Check the API URL.)';
    } else {
      error.displayMessage = 'Something went wrong. Please try again.';
    }
    return Promise.reject(error);
  },
);

export const taskApi = {
  // GET /tasks, list with filters
  list(params) {
    return api.get('/tasks', { params });
  },

  // POST, create a task
  create(data) {
    return api.post('/tasks', data);
  },

  // PATCH update a task, also used for status changes
  update(id, data) {
    return api.patch(`/tasks/${id}`, data);
  },

  // DELETE a task
  remove(id) {
    return api.delete(`/tasks/${id}`);
  },
};

export default taskApi;
