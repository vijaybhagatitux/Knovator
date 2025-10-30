// src/queues/workers.ts
import { startRunsWorker } from './runs.worker.js';
import { startItemsWorker } from './items.worker.js'; // ensure this exports startItemsWorker
import { makeLogger } from '../config/logger.js';

const log = makeLogger('workers');

export async function startWorkers() {
  // start items worker first (so item queue is processing while runs enqueues)
  const itemsWorker = await startItemsWorker();
  const runsWorker = await startRunsWorker();
  log.info('All workers started');
  return { itemsWorker, runsWorker };
}
