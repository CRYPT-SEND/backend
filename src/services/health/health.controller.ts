import { Request, Response } from 'express';
import { getHealthSnapshot, livenessOk } from './health.service';

export function livenessHandler(_req: Request, res: Response) {
  return res.status(livenessOk() ? 200 : 500).json({ status: 'ok' });
}

export async function readinessHandler(_req: Request, res: Response) {
  const snap = await getHealthSnapshot({
    version: process.env.APP_VERSION,
    commit: process.env.GIT_COMMIT,
    env: process.env.NODE_ENV,
  });
  const ready = snap.status === 'up';
  return res.status(ready ? 200 : 503).json(snap);
}

export async function healthHandler(_req: Request, res: Response) {
  const snap = await getHealthSnapshot({
    version: process.env.APP_VERSION,
    commit: process.env.GIT_COMMIT,
    env: process.env.NODE_ENV,
  });
  const code = snap.status === 'down' ? 503 : 200;
  return res.status(code).json(snap);
}
