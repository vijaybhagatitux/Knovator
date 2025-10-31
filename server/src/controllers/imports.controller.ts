// src/controllers/imports.controller.ts
import { Request, Response } from 'express';
import ImportLogs from '../db/models/importlogs.js';
import { enqueueImportRun } from '../queues/runs.queue.js';
import { env } from '../config/env.js';

/**
 * List import logs with pagination + optional filters
 * GET /api/imports/logs
 */
export async function listImportLogs(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.sourceUrl) filter.sourceUrl = String(req.query.sourceUrl);
    if (req.query.status) filter.status = String(req.query.status);

    const [total, rows] = await Promise.all([
      ImportLogs.countDocuments(filter),
      ImportLogs.find(filter).sort({ startedAt: -1 }).skip(skip).limit(limit).lean()
    ]);

    res.json({ total, page, limit, rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
}

/**
 * Get single import log by id
 * GET /api/imports/logs/:id
 */
export async function getImportLog(req: Request, res: Response) {
  try {
    const doc = await ImportLogs.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
}

/**
 * Trigger an import run manually.
 * POST /api/imports/run
 * body: { sourceUrl?: string }  (if omitted, uses FEEDS from env and enqueues all)
 */
export async function runImport(req: Request, res: Response) {
  try {
    const { sourceUrl } = req.body as { sourceUrl?: string };

    // If a sourceUrl is provided, enqueue that one. Otherwise enqueue all feeds from env.
    if (sourceUrl) {
      await enqueueImportRun(sourceUrl);
      return res.status(202).json({ message: 'Import run enqueued', sourceUrl });
    }

    // split FEEDS env by comma
    const feeds = (env.FEEDS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!feeds.length) return res.status(400).json({ error: 'No FEEDS configured' });

    for (const f of feeds) await enqueueImportRun(f);

    return res.status(202).json({ message: 'Import runs enqueued', total: feeds.length, feeds });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
