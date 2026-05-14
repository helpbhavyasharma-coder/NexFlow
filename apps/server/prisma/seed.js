import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 12);
  const bhavya = await prisma.user.upsert({ where: { email: 'bhavya@nexflow.dev' }, update: {}, create: { username: 'Bhavya', email: 'bhavya@nexflow.dev', password, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bhavya' } });
  const harleen = await prisma.user.upsert({ where: { email: 'harleen@nexflow.dev' }, update: {}, create: { username: 'Harleen', email: 'harleen@nexflow.dev', password, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Harleen' } });
  const team = await prisma.team.upsert({ where: { inviteCode: 'NEXFLOWDEMO' }, update: {}, create: { name: 'NexFlow Launch', description: 'Demo workspace for realtime collaboration', ownerId: bhavya.id, inviteCode: 'NEXFLOWDEMO', members: { create: [{ userId: bhavya.id, role: 'OWNER' }, { userId: harleen.id, role: 'ADMIN' }] } } });
  await prisma.task.createMany({ data: [{ teamId: team.id, title: 'Design dashboard polish', description: 'Finalize glassmorphism cards and responsive layout.', priority: 'HIGH', status: 'PENDING', assignedTo: bhavya.id }, { teamId: team.id, title: 'API integration', description: 'Connect auth, teams, tasks, and notifications.', priority: 'URGENT', status: 'IN_PROGRESS', assignedTo: harleen.id, startedBy: harleen.id, startedAt: new Date() }, { teamId: team.id, title: 'Write launch checklist', description: 'Prepare production deployment checklist.', priority: 'MEDIUM', status: 'REVIEW' }, { teamId: team.id, title: 'Seed analytics data', description: 'Add completed task samples.', priority: 'LOW', status: 'COMPLETED', completedBy: bhavya.id, completedAt: new Date() }] });
}

main().finally(async () => prisma.$disconnect());
