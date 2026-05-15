import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';

const onlineUsers = new Map();

export function registerSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, env.accessSecret);
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user) return next(new Error('Invalid user'));
      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    const userSockets = onlineUsers.get(socket.user.id) || new Set();
    userSockets.add(socket.id);
    onlineUsers.set(socket.user.id, userSockets);
    socket.join(`user:${socket.user.id}`);
    io.emit('user_online', { userId: socket.user.id, username: socket.user.username });

    socket.on('team_join', async (teamId) => {
      const member = await prisma.teamMember.findUnique({ where: { userId_teamId: { userId: socket.user.id, teamId } } });
      if (member) socket.join(`team:${teamId}`);
    });

    socket.on('typing_start', ({ teamId, taskId }) => socket.to(`team:${teamId}`).emit('typing_start', { taskId, user: { id: socket.user.id, username: socket.user.username } }));
    socket.on('typing_stop', ({ teamId, taskId }) => socket.to(`team:${teamId}`).emit('typing_stop', { taskId, userId: socket.user.id }));

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(socket.user.id);
      sockets?.delete(socket.id);
      if (!sockets?.size) {
        onlineUsers.delete(socket.user.id);
        io.emit('user_offline', { userId: socket.user.id });
      }
    });
  });
}

export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}
