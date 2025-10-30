// src/queues/runs.queue.js
import { makeQueue } from './connections.js';

export const runsQueueName = 'job-import-runs';
export let runsQueue = null;

// Lazy initialize queue
(async () => {
  runsQueue = await makeQueue(runsQueueName);
  // console.log('runsQueue ready');
})();

/**
 * Enqueue a single feed run
 */
export async function enqueueImportRun(sourceUrl) {
  if (!runsQueue) runsQueue = await makeQueue(runsQueueName);
  return runsQueue.add('run', { sourceUrl });
}

/**
 * Enqueue multiple feeds at once (used by cron job or manual trigger)
 */
export async function addRunBulk(feeds) {
  if (!runsQueue) runsQueue = await makeQueue(runsQueueName);

  const jobs = feeds.map((url) => ({
    name: 'run',
    data: { sourceUrl: url },
  }));

  await runsQueue.addBulk(jobs);

  return jobs.length;
}
