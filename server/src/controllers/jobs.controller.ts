// src/controllers/jobs.controller.ts
import { Request, Response } from 'express';
import job from '../db/models/job';

/**
 * GET /api/jobs
 * Query params: page, limit, sourceUrl, company, location, type, search
 */
export async function listJobs(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.sourceUrl) filter.sourceUrl = String(req.query.sourceUrl);
    if (req.query.company) filter.company = String(req.query.company);
    if (req.query.location) filter.location = String(req.query.location);
    if (req.query.type) filter.type = String(req.query.type);

    if (req.query.search) {
      const q = String(req.query.search);
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const [total, rows] = await Promise.all([
      job.countDocuments(filter),
      job.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean()
    ]);

    res.json({ total, page, limit, rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
}

/**
 * GET /api/jobs/:id
 */
export async function getJob(req: Request, res: Response) {
  try {
    const doc = await job.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
}
