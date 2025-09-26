import admin from 'firebase-admin';
import { newKit } from '@celo/contractkit';
import { BLOCKCHAIN_CONFIG } from '@src/common/config/blockchain.config';

type CheckStatus = 'up' | 'down';
type OverallStatus = 'up' | 'degraded' | 'down';

export interface DependencyCheck {
  name: string;
  status: CheckStatus;
  latencyMs: number;
  details?: Record<string, unknown>;
  error?: string;
}

export interface HealthSnapshot {
  status: OverallStatus;
  checkedAt: string;
  uptimeSec: number;
  nodeVersion: string;
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  dependencies: DependencyCheck[];
  version?: string;
  commit?: string;
  env?: string;
}

async function timeIt<T>(fn: () => Promise<T>): Promise<{ ms: number; result?: T; error?: Error }> {
  const start = Date.now();
  try {
    const result = await fn();
    return { ms: Date.now() - start, result };
  } catch (error) {
    return { ms: Date.now() - start, error: error as Error };
  }
}

export function livenessOk(): boolean {
  // Si ce handler s'exécute, le process est vivant
  return true;
}

export async function checkFirestore(): Promise<DependencyCheck> {
  const r = await timeIt(async () => {
    await admin.firestore().doc(`health/_ping_${Date.now()}`).get();
    return true;
  });
  return {
    name: 'firestore',
    status: r.error ? 'down' : 'up',
    latencyMs: r.ms,
    error: r.error?.message,
  };
}

export async function checkFirebaseAuth(): Promise<DependencyCheck> {
  const r = await timeIt(async () => {
    try {
      await admin.auth().getUserByEmail('healthcheck@invalid.local');
    } catch {
      // On a une réponse: l'admin SDK fonctionne
    }
    return true;
  });
  return {
    name: 'firebase-auth',
    status: r.error ? 'down' : 'up',
    latencyMs: r.ms,
    error: r.error?.message,
  };
}

export async function checkCeloRpc(): Promise<DependencyCheck> {
  const kit = newKit(BLOCKCHAIN_CONFIG.CELO_RPC_URL);
  const r = await timeIt(async () => {
    const [blockNumber, chainId] = await Promise.all([
      kit.web3.eth.getBlockNumber(),
      kit.web3.eth.getChainId(),
    ]);
    return { blockNumber, chainId } as Record<string, unknown>;
  });
  return {
    name: 'celo-rpc',
    status: r.error ? 'down' : 'up',
    latencyMs: r.ms,
    details: r.result,
    error: r.error?.message,
  };
}

export async function getHealthSnapshot(opts?: {
  version?: string; commit?: string; env?: string;
}): Promise<HealthSnapshot> {
  const [fs, auth, celo] = await Promise.all([
    checkFirestore(),
    checkFirebaseAuth(),
    checkCeloRpc(),
  ]);

  const dep = [fs, auth, celo];
  const allUp = dep.every(d => d.status === 'up');
  const someDown = dep.some(d => d.status === 'down');

  const status: OverallStatus = allUp ? 'up' : (someDown ? 'down' : 'degraded');

  const mu = process.memoryUsage();
  return {
    status,
    checkedAt: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memory: {
      rss: mu.rss,
      heapUsed: mu.heapUsed,
      heapTotal: mu.heapTotal,
    },
    dependencies: dep,
    version: opts?.version,
    commit: opts?.commit,
    env: opts?.env,
  };
}
