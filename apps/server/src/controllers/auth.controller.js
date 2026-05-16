import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client.js';
import { sanitizeUser } from '../utils/sanitizeUser.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

const refreshSessionDays = 90;

function refreshSessionExpiry() {
  return new Date(Date.now() + refreshSessionDays * 24 * 60 * 60 * 1000);
}

async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await prisma.refreshSession.create({
    data: { userId: user.id, token: refreshToken, expiresAt: refreshSessionExpiry() },
  });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
  return { accessToken, refreshToken };
}

export async function register(req, res) {
  const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (existing) return res.status(409).json({ message: 'Email already registered' });
  const password = await bcrypt.hash(req.body.password, 12);
  const user = await prisma.user.create({ data: { ...req.body, password } });
  const { accessToken, refreshToken } = await issueTokens(user);
  res.status(201).json({ user: sanitizeUser(user), accessToken, refreshToken });
}

export async function login(req, res) {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const { accessToken, refreshToken } = await issueTokens(user);
  res.json({ user: sanitizeUser(user), accessToken, refreshToken });
}

export async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  let session = await prisma.refreshSession.findUnique({ where: { token: refreshToken } });
  if (!session && user?.refreshToken === refreshToken) {
    session = await prisma.refreshSession.create({
      data: { userId: user.id, token: refreshToken, expiresAt: refreshSessionExpiry() },
    });
  }
  if (!user || !session || session.userId !== user.id || session.expiresAt < new Date()) {
    if (session) await prisma.refreshSession.delete({ where: { id: session.id } });
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  res.json({ accessToken: signAccessToken(user), user: sanitizeUser(user) });
}

export async function me(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

export async function updateProfile(req, res) {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { username: req.body.username, avatar: req.body.avatar } });
  res.json({ user: sanitizeUser(user) });
}

export async function logout(req, res) {
  const refreshToken = req.body?.refreshToken;
  if (refreshToken) await prisma.refreshSession.deleteMany({ where: { userId: req.user.id, token: refreshToken } });
  await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
  res.json({ message: 'Logged out' });
}
