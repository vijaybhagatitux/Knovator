// src/api/jobs.routes.ts
import { Router } from 'express';
import { listJobs, getJob } from '../controllers/jobs.controller.js';

const router = Router();

router.get('/', listJobs);
router.get('/:id', getJob);

export default router;
