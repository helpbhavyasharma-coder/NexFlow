import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.js';
import { prisma } from './prisma/client.js';
import { analyticsRoutes } from './routes/analytics.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { bundleRoutes } from './routes/bundle.routes.js';
import { chatRoutes } from './routes/chat.routes.js';
import { notificationRoutes } from './routes/notification.routes.js';
import { taskRoutes } from './routes/task.routes.js';
import { teamRoutes } from './routes/team.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientUrls, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  app.get('/health', (req, res) => res.json({ status: 'ok', name: 'NexFlow API' }));
  app.get('/health/db', async (req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
      next(error);
    }
  });
  app.use('/api/admin', adminRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/bundles', bundleRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
