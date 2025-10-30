import { createClient } from 'redis';
import { Queue, QueueEvents } from 'bullmq';
import { env } from '../config/env.js';
import { makeLogger } from '../config/logger.js';

const log = makeLogger('redis-conn');

function parseRedisUrl(raw: string) {
  const u = new URL(raw);
  const protocol = u.protocol; // 'redis:' or 'rediss:'
  const isTls = protocol === 'rediss:';
  const password = u.password || undefined;
  const host = u.hostname;
  const port = Number(u.port || 6379);
  return { host, port, password, isTls, raw };
}

/**
 * Try to connect with TLS first (if requested), otherwise try non-TLS.
 * Returns an object shaped for BullMQ: { connection: { host, port, password, tls? } }
 */
export async function buildBullConnection() {
  const { host, port, password, isTls, raw } = parseRedisUrl(env.REDIS_URL);
  const base = { host, port, password };

  if (!isTls) {
    log.info({ host, port }, 'Using non-TLS redis connection (redis://)');
    return { connection: base };
  }

  // Try TLS
  try {
    log.info({ host, port }, 'Attempting TLS connection (rediss://) to Redis');

    // Force secure TLS settings (avoids wrong version number errors)
    const client = createClient({
      url: raw,
      socket: {
        tls: true,
        rejectUnauthorized: false, // skip cert validation (needed for Redis Cloud)
        secureProtocol: 'TLSv1_2_method', // enforce correct TLS version
      },
    } as any);

    await client.connect();
    await client.ping();
    await client.quit();

    log.info({ host, port }, 'TLS connection successful');
    return {
      connection: {
        host,
        port,
        password,
        tls: { rejectUnauthorized: false },
      },
    };
  } catch (err: any) {
    log.warn({ err: err?.message || String(err) }, 'TLS connection failed — falling back to non-TLS');
    return { connection: base };
  }
}

/**
 * Shared Bull connection; lazy-initialised once.
 */
let _bullConnection: any | null = null;
export async function getBullConnection() {
  if (!_bullConnection) _bullConnection = await buildBullConnection();
  return _bullConnection;
}

/**
 * Create Queue / QueueEvents asynchronously (wraps getBullConnection).
 */
export async function makeQueue(name: string) {
  const conn = await getBullConnection();
  return new Queue(name, conn);
}

export async function makeQueueEvents(name: string) {
  const conn = await getBullConnection();
  return new QueueEvents(name, conn);
}

/**
 * bootRedis: returns a single Redis client that follows the same TLS fallback rules.
 */
let sharedClient: ReturnType<typeof createClient> | null = null;

export async function bootRedis() {
  if (sharedClient && sharedClient.isOpen) return sharedClient;

  const { host, port, password, isTls, raw } = parseRedisUrl(env.REDIS_URL);

  if (isTls) {
    try {
      log.info({ host, port }, 'bootRedis: attempting TLS client (rediss://)');

      sharedClient = createClient({
        url: raw,
        socket: {
          tls: true,
          rejectUnauthorized: false,
          secureProtocol: 'TLSv1_2_method',
        },
      } as any);

      await sharedClient.connect();
      await sharedClient.ping();

      log.info('bootRedis: TLS client connected');
      return sharedClient;
    } catch (err: any) {
      log.warn({ err: err?.message || String(err) }, 'bootRedis: TLS client failed — trying non-TLS client');

      try {
        sharedClient = createClient({ socket: { host, port }, password } as any);
        await sharedClient.connect();
        await sharedClient.ping();
        log.info('bootRedis: non-TLS client connected (fallback)');
        return sharedClient;
      } catch (err2: any) {
        log.error({ err2: err2?.message || String(err2) }, 'bootRedis: non-TLS fallback also failed');
        throw err2;
      }
    }
  }

  try {
    log.info({ host, port }, 'bootRedis: creating non-TLS client');
    sharedClient = createClient({ url: env.REDIS_URL } as any);
    await sharedClient.connect();
    await sharedClient.ping();
    log.info('bootRedis: non-TLS client connected');
    return sharedClient;
  } catch (err: any) {
    log.error({ err: err?.message || String(err) }, 'bootRedis: non-TLS client failed');
    throw err;
  }
}
