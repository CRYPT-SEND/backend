import { Router } from 'express';
import { getCeloStatus, streamCeloStatus } from './status.controller';

const router = Router();

// GET /blockchain/status
router.get('/status', getCeloStatus);
router.get('/status/stream', streamCeloStatus);

export default router;
