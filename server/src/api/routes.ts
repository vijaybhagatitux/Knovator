import { Express, Router } from 'express';
import { importsRouter } from './imports.router.js';
import { healthRouter } from './health.router.js';

export function routes(app: Express) {
  const api = Router();
  api.use('/imports', importsRouter);
  api.use('/health', healthRouter);
  app.use('/api', api);
}
