import { makeQueueEvents, makeQueue } from './connections.js';
import importlogs from '../db/models/importlogs.js';

const queueName = 'job-import-items';
const ev = makeQueueEvents(queueName);
const queue = makeQueue(queueName);

// Correct event payload type for QueueEvents "failed"
interface QueueEventsFailedData {
  jobId: string;
  failedReason?: string;
  prev?: string;
}

ev.on('failed', async (data: QueueEventsFailedData) => {
  try {
    if (!data.jobId) return;

    const job = await queue.getJob(data.jobId);
    const d = job?.data ?? {};
    if (!d.importLogId) return;

    const reason = data.failedReason ?? 'Unknown failure';

    await importlogs.updateOne(
      { _id: d.importLogId },
      {
        $inc: { failedJobs: 1 },
        $push: { failures: { externalId: d.externalId ?? '-', reason } },
      }
    );
  } catch (err) {
    console.error('Error in failed event handler:', err);
  }
});

export function initQueueEvents() {
  return ev;
}
