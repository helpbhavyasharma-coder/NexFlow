import { Router } from 'express';
import { adminLogin, adminOverview } from '../controllers/admin.controller.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { adminLoginSchema, validate } from '../validations/schemas.js';

export const adminRoutes = Router();

adminRoutes.post('/login', validate(adminLoginSchema), adminLogin);
adminRoutes.get('/overview', adminAuth, adminOverview);
