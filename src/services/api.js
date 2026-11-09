// Centralised Axios client for the future Spring Boot REST API.
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Backend integration: attach the JWT / session token here (prefer HttpOnly cookies over LocalStorage tokens).
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || (err.request ? 'Cannot reach the server. Please try again.' : err.message);
    return Promise.reject(Object.assign(err, { userMessage: message }));
  },
);
export default api;
