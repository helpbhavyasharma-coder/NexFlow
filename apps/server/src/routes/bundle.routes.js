import { Router } from 'express';
import { createBundle, deleteBundle, listBundles } from '../controllers/bundle.controller.js';
import { auth } from '../middleware/auth.js';
import { minRole, requireTeamRole } from '../middleware/permissions.js';
import { bundleSchema, validate } from '../validations/schemas.js';

export const bundleRoutes = Router();

bundleRoutes.use(auth);
bundleRoutes.get('/team/:teamId', requireTeamRole, listBundles);
bundleRoutes.post('/', validate(bundleSchema), requireTeamRole, minRole('MEMBER'), createBundle);
bundleRoutes.delete('/:bundleId', deleteBundle);
