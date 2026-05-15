import { prisma } from '../prisma/client.js';

const includeBundle = { _count: { select: { tasks: true } } };

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
  req.app.get('io')?.to(`team:${bundle.teamId}`).emit('bundle_created', bundle);
  res.status(201).json(bundle);
}
