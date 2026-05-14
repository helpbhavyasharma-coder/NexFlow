import { prisma } from '../prisma/client.js';

export async function notifyTeam(teamId, content, io) {
  const members = await prisma.teamMember.findMany({ where: { teamId }, select: { userId: true } });
  const notifications = await prisma.$transaction(members.map((member) => prisma.notification.create({ data: { userId: member.userId, content } })));
  notifications.forEach((notification) => io?.to(`user:${notification.userId}`).emit('notification_created', notification));
  return notifications;
}
