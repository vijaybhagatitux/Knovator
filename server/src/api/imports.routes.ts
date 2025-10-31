// src/api/imports.routes.ts
import { Router } from 'express';
import { listImportLogs, getImportLog, runImport } from '../controllers/imports.controller.js';

const router = Router();

// import logs list / detail
router.get('/logs', listImportLogs);
router.get('/logs/:id', getImportLog);

// trigger import runs (manual)
router.post('/run', runImport);

export default router;
