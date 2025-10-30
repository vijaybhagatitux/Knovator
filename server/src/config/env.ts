// add this line at the very top
import 'dotenv/config';

import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string(),
  REDIS_URL: z.string(),
  FEEDS: z.string().default(''),
  WORKER_CONCURRENCY: z.coerce.number().default(10),
  ITEMS_RETRY_ATTEMPTS: z.coerce.number().default(3),
  FETCH_TIMEOUT_MS: z.coerce.number().default(15000),
  CRON_EVERY: z.string().default('0 * * * *')
});

export const env = schema.parse(process.env);
