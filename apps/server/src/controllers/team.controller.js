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

export async function updateMemberRole(req, res) {
  const member = await prisma.teamMember.findUnique({ where: { id: req.params.memberId }, include: { user: true } });
  if (!member || member.teamId !== req.params.teamId) return res.status(404).json({ message: 'Member not found' });
  if (member.userId === req.user.id && req.body.role !== 'OWNER') return res.status(409).json({ message: 'Transfer ownership before changing your owner role' });

  if (req.body.role === 'OWNER') {
    await prisma.$transaction([
      prisma.team.update({ where: { id: req.params.teamId }, data: { ownerId: member.userId } }),
      prisma.teamMember.update({ where: { userId_teamId: { userId: req.user.id, teamId: req.params.teamId } }, data: { role: 'ADMIN' } }),
      prisma.teamMember.update({ where: { id: member.id }, data: { role: 'OWNER' } }),
    ]);
  } else {
    await prisma.teamMember.update({ where: { id: member.id }, data: { role: req.body.role } });
  }

  const team = await prisma.team.findUnique({ where: { id: req.params.teamId }, include: includeTeam });
  req.app.get('io')?.to(`team:${req.params.teamId}`).emit('team_updated', team);
  res.json(team);
}

export async function removeMember(req, res) {
  const member = await prisma.teamMember.findUnique({ where: { id: req.params.memberId } });
  if (!member || member.teamId !== req.params.teamId) return res.status(404).json({ message: 'Member not found' });
  if (member.role === 'OWNER') return res.status(409).json({ message: 'Owner cannot be removed' });
  await prisma.teamMember.delete({ where: { id: member.id } });
  const team = await prisma.team.findUnique({ where: { id: req.params.teamId }, include: includeTeam });
  const io = req.app.get('io');
  io?.to(`team:${req.params.teamId}`).emit('team_updated', team);
  io?.to(`user:${member.userId}`).emit('team_removed', { teamId: req.params.teamId });
  res.json(team);
}

export async function leaveTeam(req, res) {
  const member = await prisma.teamMember.findUnique({ where: { userId_teamId: { userId: req.user.id, teamId: req.params.teamId } } });
  if (!member) return res.status(404).json({ message: 'Membership not found' });
  if (member.role === 'OWNER') return res.status(409).json({ message: 'Transfer ownership before leaving this group' });
  await prisma.teamMember.delete({ where: { id: member.id } });
  const team = await prisma.team.findUnique({ where: { id: req.params.teamId }, include: includeTeam });
  req.app.get('io')?.to(`team:${req.params.teamId}`).emit('team_updated', team);
  res.json({ teamId: req.params.teamId });
}
