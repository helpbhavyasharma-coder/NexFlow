import { Router } from 'express';
import { login, logout, me, refresh, register, updateProfile } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';
import { loginSchema, profileSchema, registerSchema, validate } from '../validations/schemas.js';

export const authRoutes = Router();

authRoutes.post('/register', validate(registerSchema), register);
authRoutes.post('/login', validate(loginSchema), login);
authRoutes.post('/refresh', refresh);
authRoutes.get('/me', auth, me);
authRoutes.patch('/profile', auth, validate(profileSchema), updateProfile);
authRoutes.post('/logout', auth, logout);
