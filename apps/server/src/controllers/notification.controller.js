import { prisma } from '../prisma/client.js';

export async function listNotifications(req, res) {
  const notifications = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.json(notifications);
}

export async function markRead(req, res) {
  const notification = await prisma.notification.update({ where: { id: req.params.notificationId }, data: { read: true } });
  res.json(notification);
}
