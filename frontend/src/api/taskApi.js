import axios from 'axios';

/**
 * Single Axios instance for every request to the backend.
 *
 * baseURL resolution:
 *  - VITE_API_URL set (e.g. https://todo-api.onrender.com/api/v1 on Netlify) → that
 *  - otherwise '/api/v1' → proxied by Vite to the backend in development
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Normalize backend error responses into a readable message.
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
  /** GET /tasks — list with optional filters { status, priority, q, sort, page, limit } */
  list(params) {
    return api.get('/tasks', { params });
  },

  /** GET /tasks/search?q= — full-text search across title + description */
  search(q) {
    return api.get('/tasks/search', { params: { q } });
  },

  /** GET /tasks/:id */
  get(id) {
    return api.get(`/tasks/${id}`);
  },

  /** POST /tasks */
  create(data) {
    return api.post('/tasks', data);
  },

  /** PATCH /tasks/:id — partial update, e.g. { status: 'completed' } */
  update(id, data) {
    return api.patch(`/tasks/${id}`, data);
  },

  /** DELETE /tasks/:id */
  remove(id) {
    return api.delete(`/tasks/${id}`);
  },
};

export default taskApi;
