import { Router } from 'express';
import { createMessage, listMessages } from '../controllers/chat.controller.js';
import { auth } from '../middleware/auth.js';
import { requireTeamRole } from '../middleware/permissions.js';
import { chatMessageSchema, validate } from '../validations/schemas.js';

export const chatRoutes = Router();

chatRoutes.use(auth);
chatRoutes.get('/team/:teamId', requireTeamRole, listMessages);
chatRoutes.post('/', validate(chatMessageSchema), requireTeamRole, createMessage);
