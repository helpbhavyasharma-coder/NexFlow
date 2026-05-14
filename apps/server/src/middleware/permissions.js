import { prisma } from '../prisma/client.js';

const rank = { VIEWER: 1, MEMBER: 2, ADMIN: 3, OWNER: 4 };

export async function requireTeamRole(req, res, next) {
  const teamId = req.params.teamId || req.body.teamId || req.query.teamId;
  if (!teamId) return res.status(400).json({ message: 'teamId is required' });
  const member = await prisma.teamMember.findUnique({ where: { userId_teamId: { userId: req.user.id, teamId } } });
  if (!member) return res.status(403).json({ message: 'Team access denied' });
  req.membership = member;
  next();
}

export function minRole(role) {
  return (req, res, next) => {
    if (rank[req.membership?.role] < rank[role]) return res.status(403).json({ message: 'Insufficient permissions' });
    next();
  };
}
