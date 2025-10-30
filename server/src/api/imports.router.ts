import { Router } from 'express';
import importlogs from '../db/models/importlogs.js';
import { runImports } from '../services/imports.service.js';

export const importsRouter = Router();

importsRouter.post('/run', async (req, res, next) => {
  try {
    const { sourceUrl } = req.body || {};
    const out = await runImports(sourceUrl);
    res.json(out);
  } catch (e) { next(e); }
});

importsRouter.get('/logs', async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const [rows, total] = await Promise.all([
    importlogs.find().sort({ startedAt: -1 }).skip((page-1)*limit).limit(limit).lean(),
    importlogs.countDocuments()
  ]);
  res.json({ rows, total, page, limit });
});

importsRouter.get('/logs/:id', async (req, res) => {
  const doc = await importlogs.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: 'not found' });
  res.json(doc);
});
