import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { registerSockets } from './sockets/index.js';

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: env.clientUrls, credentials: true } });

app.set('io', io);
registerSockets(io);

server.listen(env.port, () => {
  console.log(`NexFlow API running on http://localhost:${env.port}`);
});
