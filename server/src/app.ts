import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { makeLogger } from './config/logger.js';
import { routes } from './api/routes.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger: makeLogger('http') as any }));

  app.get('/', (_req, res) => res.json({ ok: true, name: 'job-importer-server' }));

  routes(app);

  // error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Error' });
  });

  return app;
}
