import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

let refreshPromise = null;

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
    setAuthState({ accessToken: data.accessToken });
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
      toast.error('Session expired. Please login again.');
      return Promise.reject(refreshError);
    });
  }
  const message = error.response?.data?.message || 'Something went wrong';
  toast.error(message);
  return Promise.reject(error);
});
