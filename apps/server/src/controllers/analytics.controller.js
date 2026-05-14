import { prisma } from '../prisma/client.js';

export async function teamAnalytics(req, res) {
  const tasks = await prisma.task.findMany({ where: { teamId: req.params.teamId } });
  const byStatus = tasks.reduce((acc, task) => ({ ...acc, [task.status]: (acc[task.status] || 0) + 1 }), {});
  const byPriority = tasks.reduce((acc, task) => ({ ...acc, [task.priority]: (acc[task.priority] || 0) + 1 }), {});
  const weekly = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return { day: key, completed: tasks.filter((task) => task.completedAt?.toISOString().slice(0, 10) === key).length };
  });
  res.json({ total: tasks.length, byStatus, byPriority, weekly });
}
