import Job from '../db/models/job.js';
import importlogs from '../db/models/importlogs.js';
import { normalizeBySourceUrl } from './feeds/index.js';

export async function upsertNormalizedJob(importLogId: string, sourceUrl: string, payload: any) {
  const norm = normalizeBySourceUrl(payload, sourceUrl);
  const existing = await Job.findOne({ externalId: norm.externalId });

  let newDoc = false;
  if (!existing) {
    await Job.create(norm);
    newDoc = true;
  } else {
    const keys: (keyof typeof norm)[] = [
      'title','company','location','type','description','salary','url'
    ];
    const changed = keys.some(k => String((existing as any)[k] ?? '') !== String((norm as any)[k] ?? ''))
      || (existing.publishedAt?.toISOString() !== norm.publishedAt?.toISOString());

    if (changed) await Job.updateOne({ _id: existing._id }, { $set: { ...norm } });
  }

  await importlogs.updateOne({ _id: importLogId }, {
    $inc: {
      totalImported: 1,
      ...(newDoc ? { newJobs: 1 } : { updatedJobs: 1 })
    }
  });

  // attempt finisher: mark success when done
  const doc = await importlogs.findById(importLogId).lean();
  if (doc && (doc.totalImported + (doc.failedJobs || 0)) >= (doc.totalFetched || 0) && doc.status === 'running') {
    await importlogs.updateOne({ _id: importLogId }, { $set: { status: 'success', finishedAt: new Date() } });
  }
}
