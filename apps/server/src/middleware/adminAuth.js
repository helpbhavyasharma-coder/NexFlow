import { verifyAdminToken } from '../utils/tokens.js';

export function adminAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Admin authentication required' });
    req.admin = verifyAdminToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired admin token' });
  }
}
