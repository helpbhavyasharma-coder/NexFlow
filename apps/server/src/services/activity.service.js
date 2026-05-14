import { prisma } from '../prisma/client.js';

export async function createActivity(teamId, userId, content) {
  return prisma.activity.create({ data: { teamId, userId, content }, include: { user: { select: { id: true, username: true, avatar: true } } } });
}
