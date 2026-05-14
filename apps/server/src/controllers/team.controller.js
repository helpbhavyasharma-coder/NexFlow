import { nanoid } from 'nanoid';
import { prisma } from '../prisma/client.js';

const includeTeam = { members: { include: { user: { select: { id: true, username: true, email: true, avatar: true } } } }, tasks: true };

export async function listTeams(req, res) {
  const teams = await prisma.team.findMany({ where: { members: { some: { userId: req.user.id } } }, include: includeTeam, orderBy: { createdAt: 'desc' } });
  res.json(teams);
}

export async function createTeam(req, res) {
  const team = await prisma.team.create({ data: { name: req.body.name, description: req.body.description, ownerId: req.user.id, inviteCode: nanoid(10), members: { create: { userId: req.user.id, role: 'OWNER' } } }, include: includeTeam });
  res.status(201).json(team);
}

export async function updateTeam(req, res) {
  const team = await prisma.team.update({ where: { id: req.params.teamId }, data: { name: req.body.name, description: req.body.description }, include: includeTeam });
  res.json(team);
}

export async function deleteTeam(req, res) {
  await prisma.team.delete({ where: { id: req.params.teamId } });
  res.json({ message: 'Team deleted' });
}

export async function joinTeam(req, res) {
  const team = await prisma.team.findUnique({ where: { inviteCode: req.body.inviteCode } });
  if (!team) return res.status(404).json({ message: 'Invalid invite code' });
  await prisma.teamMember.upsert({ where: { userId_teamId: { userId: req.user.id, teamId: team.id } }, update: {}, create: { userId: req.user.id, teamId: team.id, role: 'MEMBER' } });
  const joined = await prisma.team.findUnique({ where: { id: team.id }, include: includeTeam });
  req.app.get('io')?.to(`team:${team.id}`).emit('member_joined', { teamId: team.id, userId: req.user.id });
  res.json(joined);
}
