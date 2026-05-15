import { prisma } from '../prisma/client.js';
import { createActivity } from '../services/activity.service.js';
import { notifyTeam } from '../services/notification.service.js';

const includeTask = { bundle: true, assignee: { select: { id: true, username: true, avatar: true } }, starter: { select: { id: true, username: true, avatar: true } }, completer: { select: { id: true, username: true, avatar: true } }, comments: { include: { user: { select: { id: true, username: true, avatar: true } } }, orderBy: { createdAt: 'asc' } }, attachments: true };

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
  await notifyTeam(task.teamId, `${req.user.username} created ${task.title}`, io);
  res.status(201).json(task);
}

export async function updateTask(req, res) {
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: req.body, include: includeTask });
  req.app.get('io')?.to(`team:${task.teamId}`).emit('task_updated', task);
  res.json(task);
}

export async function startTask(req, res) {
  const existing = await prisma.task.findUnique({ where: { id: req.params.taskId } });
  if (!existing) return res.status(404).json({ message: 'Task not found' });
  if (existing.status === 'COMPLETED') return res.status(409).json({ message: 'Completed task cannot be started' });
  if (existing.status === 'IN_PROGRESS' && existing.startedBy && existing.startedBy !== req.user.id) return res.status(409).json({ message: 'Another teammate is already working on this task' });
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: { status: 'IN_PROGRESS', startedBy: req.user.id, startedAt: new Date() }, include: includeTask });
  const io = req.app.get('io');
  io?.to(`team:${task.teamId}`).emit('task_started', task);
  await notifyTeam(task.teamId, `${req.user.username} is working on ${task.title}`, io);
  res.json(task);
}

export async function completeTask(req, res) {
  const existing = await prisma.task.findUnique({ where: { id: req.params.taskId } });
  if (!existing) return res.status(404).json({ message: 'Task not found' });
  if (existing.status === 'IN_PROGRESS' && existing.startedBy && existing.startedBy !== req.user.id) return res.status(403).json({ message: 'Only the teammate working on this task can complete it' });
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: { status: 'COMPLETED', completedBy: req.user.id, completedAt: new Date() }, include: includeTask });
  const io = req.app.get('io');
  io?.to(`team:${task.teamId}`).emit('task_completed', task);
  await notifyTeam(task.teamId, `${req.user.username} completed ${task.title}`, io);
  res.json(task);
}

export async function cancelTask(req, res) {
  const existing = await prisma.task.findUnique({ where: { id: req.params.taskId } });
  if (!existing) return res.status(404).json({ message: 'Task not found' });
  if (existing.startedBy && existing.startedBy !== req.user.id) return res.status(403).json({ message: 'Only the teammate working on this task can cancel it' });
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: { status: 'PENDING', startedBy: null, startedAt: null }, include: includeTask });
  req.app.get('io')?.to(`team:${task.teamId}`).emit('task_updated', task);
  res.json(task);
}

export async function reopenTask(req, res) {
  const task = await prisma.task.update({ where: { id: req.params.taskId }, data: { status: 'PENDING', completedBy: null, completedAt: null, startedBy: null, startedAt: null }, include: includeTask });
  req.app.get('io')?.to(`team:${task.teamId}`).emit('task_updated', task);
  res.json(task);
}

export async function addComment(req, res) {
  const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const comment = await prisma.comment.create({ data: { taskId: task.id, userId: req.user.id, content: req.body.content }, include: { user: { select: { id: true, username: true, avatar: true } } } });
  req.app.get('io')?.to(`team:${task.teamId}`).emit('comment_created', { taskId: task.id, comment });
  res.status(201).json(comment);
}
