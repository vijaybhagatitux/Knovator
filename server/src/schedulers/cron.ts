// src/scheduler/cron.ts
import cron from 'node-cron';
import { env } from '../config/env.js';
import { addRunBulk } from '../queues/runs.queue.js';
import { makeLogger } from '../config/logger.js';

const log = makeLogger('cron');

export function startCron() {
  const expression = env.CRON_EVERY || '0 * * * *'; // every hour default

  log.info(`Starting cron job with expression: ${expression}`);

  // Schedule cron to run periodically
  cron.schedule(expression, async () => {
    try {
      log.info('Cron triggered — starting automatic import run');
      const feeds = env.FEEDS.split(',').map(f => f.trim());
      const enqueued = await addRunBulk(feeds);
      log.info({ enqueued }, 'Feeds enqueued successfully');
    } catch (err: any) {
      log.error({ err: err?.message || err }, 'Cron import failed');
    }
  });
}
