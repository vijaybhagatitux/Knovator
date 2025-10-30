import { env } from '../config/env.js';
import { runsQueue } from '../queues/runs.queue.js';

export async function registerRepeatableFeeds() {
  const feeds = (env.FEEDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (feeds.length === 0) return;

  // clear existing and re-add (idempotent-ish)
  const repeatables = await runsQueue.getRepeatableJobs();
  await Promise.all(repeatables.map(r => runsQueue.removeRepeatableByKey(r.key)));

  await Promise.all(feeds.map(sourceUrl =>
    runsQueue.add(
      'run',
      { sourceUrl },
      { repeat: { pattern: env.CRON_EVERY, tz: 'UTC' }, jobId: `repeat:${sourceUrl}` }
    )
  ));
}
