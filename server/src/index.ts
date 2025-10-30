import { env } from './config/env.js';
import { makeLogger } from './config/logger.js';
import { connectMongo } from './db/connect.js';
import { createApp } from './app.js';
import { bootRedis } from './queues/connections.js';
import { startWorkers } from './queues/workers.js';
import { registerRepeatableFeeds } from './schedulers/registerFeeds.js';

const log = makeLogger('bootstrap');

(async () => {
  try {
    await connectMongo(env.MONGODB_URI);
    await bootRedis();
    await startWorkers();

    // register hourly imports for all feeds
    await registerRepeatableFeeds();

    const app = createApp();
    app.listen(env.PORT, () => {
      log.info(`Server listening on :${env.PORT}`);
    });
  } catch (err) {
    log.error({ err }, 'Fatal bootstrap error');
    process.exit(1);
  }
})();

// graceful shutdown
['SIGINT', 'SIGTERM'].forEach(sig => {
  process.on(sig, async () => {
    log.info(`Received ${sig}, exiting...`);
    process.exit(0);
  });
});
