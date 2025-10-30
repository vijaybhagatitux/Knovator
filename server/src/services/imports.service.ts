import { runsQueue } from '../queues/runs.queue.js';
import { env } from '../config/env.js';

export async function runImports(sourceUrl?: string) {
  const feeds = sourceUrl ? [sourceUrl] : (env.FEEDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (feeds.length === 0) throw new Error('No feeds configured');
  await runsQueue.addBulk(feeds.map(f => ({ name: 'run', data: { sourceUrl: f } })));
  return { enqueued: feeds.length };
}
