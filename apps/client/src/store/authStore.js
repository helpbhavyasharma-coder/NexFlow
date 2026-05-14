import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api.js';
import { connectSocket, disconnectSocket } from '../services/socket.js';

export const useAuthStore = create(persist((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  async login(payload) {
    const { data } = await api.post('/auth/login', payload);
    set(data);
    connectSocket(data.accessToken);
  },
  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    set(data);
    connectSocket(data.accessToken);
  },
  async logout() {
    try { await api.post('/auth/logout'); } finally { disconnectSocket(); set({ user: null, accessToken: null, refreshToken: null }); }
  },
  hydrateSocket() {
    const token = get().accessToken;
    if (token) connectSocket(token);
  },
}), { name: 'nexflow-auth' }));
