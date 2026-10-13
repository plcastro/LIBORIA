import axios from 'axios';
import { API_BASE_URL } from './utils/API_BASE';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: { 'X-Liboria-Request': '1' },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !['/login', '/signup'].includes(window.location.pathname)) {
      sessionStorage.removeItem('currentUser');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export default api;
