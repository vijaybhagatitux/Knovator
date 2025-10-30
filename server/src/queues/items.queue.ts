import { makeQueue } from "./connections";
export const itemsQueueName = 'job-import-items';

export let itemsQueue: any = null;
(async () => {
  itemsQueue = await makeQueue(itemsQueueName);
})();
export async function addItemBulk(bulk: any[]) {
  if (!itemsQueue) itemsQueue = await makeQueue(itemsQueueName);
  return itemsQueue.addBulk(bulk);
}
