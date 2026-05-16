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
