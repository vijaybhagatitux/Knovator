// src/queues/runs.worker.ts
import { Worker, JobsOptions } from 'bullmq';
import importlogs from '../db/models/importlogs.js';
import { getBullConnection } from './connections.js'; // async connection builder
import { env } from '../config/env.js';
import { fetchFeedToItems } from '../services/feeds/fetchFeed.js';
import { addItemBulk } from './items.queue.js'; // new async add bulk helper
import { makeLogger } from '../config/logger.js';

const log = makeLogger('runs-worker');

export async function startRunsWorker() {
  const conn = await getBullConnection();
  const worker = new Worker('job-import-runs', async (job) => {
    const { sourceUrl } = job.data as { sourceUrl: string };

    const logDoc = await importlogs.create({
      startedAt: new Date(),
      sourceUrl,
      status: 'running',
      totalFetched: 0,
      totalImported: 0,
      newJobs: 0,
      updatedJobs: 0,
      failedJobs: 0,
      failures: []
    });

    try {
      const items = await fetchFeedToItems(sourceUrl);
      await importlogs.updateOne({ _id: logDoc._id }, { $set: { totalFetched: items.length } });

      const opts: JobsOptions = {
        attempts: env.ITEMS_RETRY_ATTEMPTS,
        backoff: { type: 'exponential', delay: 500 },
        removeOnComplete: 1000,
        removeOnFail: 1000
      };

      // prepare bulk jobs array
      const bulk = items.map((payload: any) => ({
        name: 'import-item',
        data: { importLogId: String(logDoc._id), sourceUrl, payload },
        opts
      }));

      // Use the async helper to add bulk jobs (it ensures itemsQueue is ready)
      await addItemBulk(bulk);
      log.info({ sourceUrl, total: items.length }, 'Enqueued items for import run');
    } catch (e: any) {
      await importlogs.updateOne({ _id: logDoc._id }, {
        $set: { status: 'failed', finishedAt: new Date() },
        $push: { failures: { externalId: '-', reason: e.message || String(e) } }
      });
      log.error({ err: e }, 'Runs worker failed for source');
      throw e;
    }
  }, conn);

  // Optional: attach event listeners
  worker.on('failed', (job, err) => {
    log.warn({ jobId: job?.id, err: err?.message || err }, 'run job failed');
  });

  log.info('Runs worker started');
  return worker;
}
