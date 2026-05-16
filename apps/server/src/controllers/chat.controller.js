import { prisma } from '../prisma/client.js';

const includeMessage = {
  user: { select: { id: true, username: true, avatar: true } },
};

export async function listMessages(req, res) {
  const messages = await prisma.chatMessage.findMany({
    where: { teamId: req.params.teamId },
    include: includeMessage,
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
  res.json(messages);
}

export async function createMessage(req, res) {
  const message = await prisma.chatMessage.create({
    data: { teamId: req.body.teamId, userId: req.user.id, content: req.body.content },
    include: includeMessage,
  });
  const io = req.app.get('io');
  io?.to(`team:${message.teamId}`).emit('chat_message', message);
  io?.to(`team:${message.teamId}`).emit('workspace_changed', { teamId: message.teamId, sections: ['chat'], action: 'chat_message', at: new Date().toISOString() });
  res.status(201).json(message);
}

export async function deleteMessage(req, res) {
  const message = await prisma.chatMessage.findUnique({ where: { id: req.params.messageId } });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  const member = await prisma.teamMember.findUnique({ where: { userId_teamId: { userId: req.user.id, teamId: message.teamId } } });
  if (!member) return res.status(403).json({ message: 'Team access denied' });
  if (message.userId !== req.user.id) return res.status(403).json({ message: 'You can delete only your own message' });
  await prisma.chatMessage.delete({ where: { id: message.id } });
  const payload = { id: message.id, teamId: message.teamId };
  const io = req.app.get('io');
  io?.to(`team:${message.teamId}`).emit('chat_message_deleted', payload);
  io?.to(`team:${message.teamId}`).emit('workspace_changed', { teamId: message.teamId, sections: ['chat'], action: 'chat_message_deleted', at: new Date().toISOString() });
  res.json(payload);
}
