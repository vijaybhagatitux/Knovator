// src/api/health.router.ts
import { Router } from 'express';
import mongoose from 'mongoose';
import { bootRedis } from '../queues/connections';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const mongo = mongoose.connection.readyState === 1;
  try {
    const client = await bootRedis();
    const pong = await client.ping();
    res.json({ mongo, redis: pong === 'PONG' });
  } catch (err) {
    res.json({ mongo, redis: false });
  }
});
