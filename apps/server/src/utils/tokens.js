import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, env.accessSecret, { expiresIn: '15m' });
}

export function signRefreshToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, env.refreshSecret, { expiresIn: '90d' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.refreshSecret);
}
