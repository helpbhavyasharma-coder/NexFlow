import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';
import { signAdminToken } from '../utils/tokens.js';

export async function adminLogin(req, res) {
  if (!env.adminEmail || !env.adminPassword) {
    return res.status(503).json({ message: 'Admin login is not configured' });
  }
  const emailMatches = req.body.email.toLowerCase() === env.adminEmail.toLowerCase();
  if (!emailMatches || req.body.password !== env.adminPassword) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  res.json({ admin: { email: env.adminEmail }, adminToken: signAdminToken(env.adminEmail) });
}

export async function adminOverview(req, res) {
  const [totalUsers, totalTeams, totalTasks, totalMessages, totalNotifications, totalAttachments, taskStatusCounts, recentUsers, users, teams] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.task.count(),
    prisma.chatMessage.count(),
    prisma.notification.count(),
    prisma.attachment.count(),
    prisma.task.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, username: true, email: true, avatar: true, createdAt: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            ownedTeams: true,
            memberships: true,
            assigned: true,
            completed: true,
            chatMessages: true,
          },
        },
      },
    }),
    prisma.team.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        inviteCode: true,
        createdAt: true,
        owner: { select: { id: true, username: true, email: true, avatar: true } },
        _count: { select: { members: true, tasks: true, bundles: true, messages: true } },
        members: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            createdAt: true,
            user: { select: { id: true, username: true, email: true, avatar: true } },
          },
        },
      },
    }),
  ]);

  const tasksByStatus = taskStatusCounts.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  res.json({
    summary: {
      totalUsers,
      totalTeams,
      totalTasks,
      totalMessages,
      totalNotifications,
      totalAttachments,
      activeTasks: totalTasks - (tasksByStatus.COMPLETED || 0),
    },
    tasksByStatus,
    recentUsers,
    users,
    teams,
  });
}
