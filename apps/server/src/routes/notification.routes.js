import { Router } from 'express';
import { listNotifications, markRead } from '../controllers/notification.controller.js';
import { auth } from '../middleware/auth.js';

export const notificationRoutes = Router();

notificationRoutes.use(auth);
notificationRoutes.get('/', listNotifications);
notificationRoutes.patch('/:notificationId/read', markRead);
