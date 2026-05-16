import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, refreshAccessToken } from '../services/api.js';
import { connectSocket, disconnectSocket } from '../services/socket.js';

export const useAuthStore = create(persist((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  sessionReady: false,
  async login(payload) {
    const { data } = await api.post('/auth/login', payload);
    set({ ...data, sessionReady: true });
    connectSocket(data.accessToken);
  },
  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    set({ ...data, sessionReady: true });
    connectSocket(data.accessToken);
  },
  async updateProfile(payload) {
    const { data } = await api.patch('/auth/profile', payload);
    set({ user: data.user });
  },
  async logout() {
    const refreshToken = get().refreshToken;
    try { await api.post('/auth/logout', { refreshToken }); } finally { disconnectSocket(); set({ user: null, accessToken: null, refreshToken: null, sessionReady: true }); }
  },
  async hydrateSession() {
    if (get().accessToken) {
      connectSocket(get().accessToken);
      set({ sessionReady: true });
      return;
    }
    if (!get().refreshToken) {
      set({ sessionReady: true });
      return;
    }
    try {
      const accessToken = await refreshAccessToken();
      const stored = JSON.parse(localStorage.getItem('nexflow-auth') || '{}')?.state || {};
      set({ accessToken, user: stored.user || get().user, sessionReady: true });
      connectSocket(accessToken);
    } catch {
      disconnectSocket();
      set({ user: null, accessToken: null, refreshToken: null, sessionReady: true });
    }
  },
}), { name: 'nexflow-auth' }));
