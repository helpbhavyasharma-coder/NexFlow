import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

let refreshPromise = null;
let lastErrorToast = { message: '', time: 0 };

function showErrorToast(message, { id, cooldown = 5000 } = {}) {
  const now = Date.now();
  if (lastErrorToast.message === message && now - lastErrorToast.time < cooldown) return;
  lastErrorToast = { message, time: now };
  toast.error(message, id ? { id } : undefined);
}

function getAuthState() {
  return JSON.parse(localStorage.getItem('nexflow-auth') || '{}')?.state || {};
}

function setAuthState(patch) {
  const stored = JSON.parse(localStorage.getItem('nexflow-auth') || '{}');
  localStorage.setItem('nexflow-auth', JSON.stringify({ ...stored, state: { ...(stored.state || {}), ...patch } }));
}

export async function refreshAccessToken() {
  const refreshToken = getAuthState().refreshToken;
  if (!refreshToken) throw new Error('Refresh token missing');
  refreshPromise ||= axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken }).then(({ data }) => {
    setAuthState({ accessToken: data.accessToken, ...(data.user ? { user: data.user } : {}) });
    return data.accessToken;
  }).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAuthState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  const originalRequest = error.config;
  if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
    originalRequest._retry = true;
    return refreshAccessToken().then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    }).catch((refreshError) => {
      showErrorToast('Session expired. Please login again.', { id: 'session-expired', cooldown: 15000 });
      return Promise.reject(refreshError);
    });
  }
  if (error.response?.status === 429) {
    showErrorToast('Server is busy. Please wait a moment.', { id: 'rate-limit', cooldown: 15000 });
    return Promise.reject(error);
  }
  const message = error.response?.data?.message || 'Something went wrong';
  showErrorToast(message);
  return Promise.reject(error);
});
