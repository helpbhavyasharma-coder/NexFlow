import { prisma } from '../prisma/client.js';
import { createActivity } from '../services/activity.service.js';
import { notifyTeam } from '../services/notification.service.js';

const includeTask = { bundle: true, assignee: { select: { id: true, username: true, avatar: true } }, starter: { select: { id: true, username: true, avatar: true } }, completer: { select: { id: true, username: true, avatar: true } }, comments: { include: { user: { select: { id: true, username: true, avatar: true } } }, orderBy: { createdAt: 'asc' } }, attachments: true };
const rank = { VIEWER: 1, MEMBER: 2, ADMIN: 3, OWNER: 4 };

function emitWorkspaceChange(io, teamId, sections, action) {
  io?.to(`team:${teamId}`).emit('workspace_changed', { teamId, sections, action, at: new Date().toISOString() });
}

async function requireTaskRole(req, res, minimum = 'VIEWER') {
  const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return null;
  }
  const member = await prisma.teamMember.findUnique({ where: { userId_teamId: { userId: req.user.id, teamId: task.teamId } } });
  if (!member) {
    res.status(403).json({ message: 'Team access denied' });
    return null;
  }
  if (rank[member.role] < rank[minimum]) {
    res.status(403).json({ message: 'Insufficient permissions' });
    return null;
  }
  return task;
}

export async function listTasks(req, res) {
  const where = { teamId: req.params.teamId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.priority) where.priority = req.query.priority;
  if (req.query.bundleId) where.bundleId = req.query.bundleId === 'none' ? null : req.query.bundleId;
  if (req.query.assignedTo) where.assignedTo = req.query.assignedTo;
  if (req.query.search) where.OR = [{ title: { contains: req.query.search, mode: 'insensitive' } }, { description: { contains: req.query.search, mode: 'insensitive' } }];
  const tasks = await prisma.task.findMany({ where, include: includeTask, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }] });
  res.json(tasks);
}

export async function createTask(req, res) {
  const data = { ...req.body, deadline: req.body.deadline ? new Date(req.body.deadline) : null };
  if (data.bundleId) {
    const bundle = await prisma.taskBundle.findFirst({ where: { id: data.bundleId, teamId: data.teamId } });
    if (!bundle) return res.status(422).json({ message: 'Bundle does not belong to this group' });
  }
  const task = await prisma.task.create({ data, include: includeTask });
  const io = req.app.get('io');
  const activity = await createActivity(task.teamId, req.user.id, `${req.user.username} created ${task.title}`);
  io?.to(`team:${task.teamId}`).emit('task_created', task);
  io?.to(`team:${task.teamId}`).emit('activity_created', activity);
  emitWorkspaceChange(io, task.teamId, ['tasks', 'analytics'], 'task_created');
  await notifyTeam(task.teamId, `${req.user.username} created ${task.title}`, io);
  res.status(201).json(task);
}

export async function updateTask(req, res) {
  const existing = await requireTaskRole(req, res, 'MEMBER');
  if (!existing) return;
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: req.body, include: includeTask });
  const io = req.app.get('io');
  io?.to(`team:${task.teamId}`).emit('task_updated', task);
  emitWorkspaceChange(io, task.teamId, ['tasks', 'analytics'], 'task_updated');
  res.json(task);
}

export async function startTask(req, res) {
  const existing = await requireTaskRole(req, res, 'MEMBER');
  if (!existing) return;
  if (existing.status === 'COMPLETED') return res.status(409).json({ message: 'Completed task cannot be started' });
  if (existing.status === 'IN_PROGRESS' && existing.startedBy && existing.startedBy !== req.user.id) return res.status(409).json({ message: 'Another teammate is already working on this task' });
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: { status: 'IN_PROGRESS', startedBy: req.user.id, startedAt: new Date() }, include: includeTask });
  const io = req.app.get('io');
  io?.to(`team:${task.teamId}`).emit('task_started', task);
  emitWorkspaceChange(io, task.teamId, ['tasks', 'analytics'], 'task_started');
  await notifyTeam(task.teamId, `${req.user.username} is working on ${task.title}`, io);
  res.json(task);
}

export async function completeTask(req, res) {
  const existing = await requireTaskRole(req, res, 'MEMBER');
  if (!existing) return;
  if (existing.status === 'IN_PROGRESS' && existing.startedBy && existing.startedBy !== req.user.id) return res.status(403).json({ message: 'Only the teammate working on this task can complete it' });
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: { status: 'COMPLETED', completedBy: req.user.id, completedAt: new Date() }, include: includeTask });
  const io = req.app.get('io');
  io?.to(`team:${task.teamId}`).emit('task_completed', task);
  emitWorkspaceChange(io, task.teamId, ['tasks', 'analytics'], 'task_completed');
  await notifyTeam(task.teamId, `${req.user.username} completed ${task.title}`, io);
  res.json(task);
}

export async function cancelTask(req, res) {
  const existing = await requireTaskRole(req, res, 'MEMBER');
  if (!existing) return;
  if (existing.startedBy && existing.startedBy !== req.user.id) return res.status(403).json({ message: 'Only the teammate working on this task can cancel it' });
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: { status: 'PENDING', startedBy: null, startedAt: null }, include: includeTask });
  const io = req.app.get('io');
  io?.to(`team:${task.teamId}`).emit('task_updated', task);
  emitWorkspaceChange(io, task.teamId, ['tasks', 'analytics'], 'task_cancelled');
  res.json(task);
}

export async function reopenTask(req, res) {
  const existing = await requireTaskRole(req, res, 'MEMBER');
  if (!existing) return;
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: { status: 'PENDING', completedBy: null, completedAt: null, startedBy: null, startedAt: null }, include: includeTask });
  const io = req.app.get('io');
  io?.to(`team:${task.teamId}`).emit('task_updated', task);
  emitWorkspaceChange(io, task.teamId, ['tasks', 'analytics'], 'task_reopened');
  res.json(task);
}

export async function deleteTask(req, res) {
  const existing = await requireTaskRole(req, res, 'ADMIN');
  if (!existing) return;
  await prisma.task.delete({ where: { id: req.params.taskId } });
  const io = req.app.get('io');
  io?.to(`team:${existing.teamId}`).emit('task_deleted', { id: existing.id, teamId: existing.teamId });
  emitWorkspaceChange(io, existing.teamId, ['tasks', 'analytics'], 'task_deleted');
  res.json({ id: existing.id, teamId: existing.teamId });
}

export async function addComment(req, res) {
  const task = await requireTaskRole(req, res, 'MEMBER');
  if (!task) return;
  const comment = await prisma.comment.create({ data: { taskId: task.id, userId: req.user.id, content: req.body.content }, include: { user: { select: { id: true, username: true, avatar: true } } } });
  const io = req.app.get('io');
  io?.to(`team:${task.teamId}`).emit('comment_created', { taskId: task.id, comment });
  emitWorkspaceChange(io, task.teamId, ['tasks'], 'comment_created');
  res.status(201).json(comment);
}
