import { Router } from 'express';
import { healthHandler, livenessHandler, readinessHandler } from './health.controller';

const router = Router();

router.get('/liveness', livenessHandler);
router.get('/readiness', readinessHandler);
router.get('/', healthHandler);

export default router;
