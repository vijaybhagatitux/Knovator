// src/queues/items.worker.ts
import { Worker } from 'bullmq';
import { getBullConnection } from './connections.js';
import { env } from '../config/env.js';
import { upsertNormalizedJob } from '../services/jobs.service.js';
import { makeLogger } from '../config/logger.js';

const log = makeLogger('items-worker');

export async function startItemsWorker() {
  const conn = await getBullConnection();
  const worker = new Worker('job-import-items', async (job) => {
    const { importLogId, sourceUrl, payload } = job.data;
    await upsertNormalizedJob(importLogId, sourceUrl, payload);
  }, { ...conn, concurrency: env.WORKER_CONCURRENCY });

  worker.on('failed', (job, err) => {
    log.warn({ jobId: job?.id, err: err?.message || err }, 'item job failed');
  });

  log.info('Items worker started');
  return worker;
}
