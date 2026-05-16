import { io } from 'socket.io-client';
import { refreshAccessToken } from './api.js';

let socket;

export function connectSocket(token) {
  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
  socket.on('connect_error', async (error) => {
    if (!/jwt|token|expired|invalid/i.test(error.message || '')) return;
    try {
      const accessToken = await refreshAccessToken();
      socket.auth = { token: accessToken };
      socket.connect();
    } catch {
      disconnectSocket();
    }
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function connectStoredSocket() {
  const token = JSON.parse(localStorage.getItem('nexflow-auth') || '{}')?.state?.accessToken;
  return token ? connectSocket(token) : null;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
