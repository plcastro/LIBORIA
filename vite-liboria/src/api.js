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

api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    const retryCount = config?._retryCount || 0;
    const isTransient = !error.response || [502, 503, 504].includes(error.response.status);

    if (config?.method?.toLowerCase() === 'get' && isTransient && !axios.isCancel(error) && retryCount < 2) {
      config._retryCount = retryCount + 1;
      await new Promise(resolve => setTimeout(resolve, retryCount === 0 ? 500 : 1500));
      return api(config);
    }

    return Promise.reject(error);
  },
);

export default api;
