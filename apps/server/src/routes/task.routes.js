import { Router } from 'express';
import multer from 'multer';
import { addComment, completeTask, createTask, listTasks, startTask, updateTask } from '../controllers/task.controller.js';
import { auth } from '../middleware/auth.js';
import { minRole, requireTeamRole } from '../middleware/permissions.js';
import { commentSchema, taskSchema, validate } from '../validations/schemas.js';
import { prisma } from '../prisma/client.js';
import { toAttachmentPayload } from '../services/upload.service.js';

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });
export const taskRoutes = Router();

taskRoutes.use(auth);
taskRoutes.get('/team/:teamId', requireTeamRole, listTasks);
taskRoutes.post('/', validate(taskSchema), requireTeamRole, minRole('MEMBER'), createTask);
taskRoutes.patch('/:taskId', updateTask);
taskRoutes.patch('/:taskId/start', startTask);
taskRoutes.patch('/:taskId/complete', completeTask);
taskRoutes.post('/:taskId/comments', validate(commentSchema), addComment);
taskRoutes.post('/:taskId/attachments', upload.single('file'), async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
  if (!task || !req.file) return res.status(400).json({ message: 'Task and file are required' });
  const attachment = await prisma.attachment.create({ data: { taskId: task.id, ...toAttachmentPayload(req.file) } });
  req.app.get('io')?.to(`team:${task.teamId}`).emit('task_updated', { id: task.id });
  res.status(201).json(attachment);
});
