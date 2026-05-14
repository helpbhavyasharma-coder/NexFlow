import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('nexflow-auth') || '{}')?.state?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  const message = error.response?.data?.message || 'Something went wrong';
  toast.error(message);
  return Promise.reject(error);
});
