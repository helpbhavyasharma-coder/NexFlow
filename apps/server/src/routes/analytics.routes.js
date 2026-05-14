import { Router } from 'express';
import { teamAnalytics } from '../controllers/analytics.controller.js';
import { auth } from '../middleware/auth.js';
import { requireTeamRole } from '../middleware/permissions.js';

export const analyticsRoutes = Router();

analyticsRoutes.use(auth);
analyticsRoutes.get('/team/:teamId', requireTeamRole, teamAnalytics);
