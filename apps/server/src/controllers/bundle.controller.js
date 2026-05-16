import { prisma } from '../prisma/client.js';

const includeBundle = { _count: { select: { tasks: true } } };
const rank = { VIEWER: 1, MEMBER: 2, ADMIN: 3, OWNER: 4 };

async function requireBundleRole(req, res, minimum = 'VIEWER') {
  const bundle = await prisma.taskBundle.findUnique({ where: { id: req.params.bundleId } });
  if (!bundle) {
    res.status(404).json({ message: 'Bundle not found' });
    return null;
  }
  const member = await prisma.teamMember.findUnique({ where: { userId_teamId: { userId: req.user.id, teamId: bundle.teamId } } });
  if (!member) {
    res.status(403).json({ message: 'Team access denied' });
    return null;
  }
  if (rank[member.role] < rank[minimum]) {
    res.status(403).json({ message: 'Insufficient permissions' });
    return null;
  }
  return bundle;
}

export async function listBundles(req, res) {
  const bundles = await prisma.taskBundle.findMany({
    where: { teamId: req.params.teamId },
    include: includeBundle,
    orderBy: { createdAt: 'asc' },
  });
  res.json(bundles);
}

export async function createBundle(req, res) {
  const bundle = await prisma.taskBundle.create({
    data: req.body,
    include: includeBundle,
  });
  const io = req.app.get('io');
  io?.to(`team:${bundle.teamId}`).emit('bundle_created', bundle);
  io?.to(`team:${bundle.teamId}`).emit('workspace_changed', { teamId: bundle.teamId, sections: ['bundles'], action: 'bundle_created', at: new Date().toISOString() });
  res.status(201).json(bundle);
}

export async function deleteBundle(req, res) {
  const bundle = await requireBundleRole(req, res, 'ADMIN');
  if (!bundle) return;
  await prisma.taskBundle.delete({ where: { id: bundle.id } });
  const io = req.app.get('io');
  const payload = { id: bundle.id, teamId: bundle.teamId };
  io?.to(`team:${bundle.teamId}`).emit('bundle_deleted', payload);
  io?.to(`team:${bundle.teamId}`).emit('workspace_changed', { teamId: bundle.teamId, sections: ['tasks', 'bundles', 'analytics'], action: 'bundle_deleted', at: new Date().toISOString() });
  res.json(payload);
}
