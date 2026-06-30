import axios from 'axios';

// Initialize Axios client configured for proxy access and credentials transmission
const axiosClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // Crucial for automatic HttpOnly cookie transmission
  headers: {
    'Content-Type': 'application/json',
  }
});

// Configure Axios request interceptor to dynamically inject anti-CSRF token if present
axiosClient.interceptors.request.use(
  (config) => {
    const csrfToken = window.sessionStorage.getItem('csrf_token') || window.localStorage.getItem('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configure response interceptor to handle authorization updates or warnings
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[Axios] Request returned 401 Unauthorized.');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
