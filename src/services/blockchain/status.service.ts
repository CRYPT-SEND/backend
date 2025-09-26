import { newKit } from '@celo/contractkit';
import { BLOCKCHAIN_CONFIG } from '@src/common/config/blockchain.config';

export interface CeloNetworkStatus {
  connected: boolean;
  chainId?: number;
  networkId?: number;
  latestBlockNumber?: number;
  latestBlockTimestamp?: number;
  gasPriceWei?: string;
  syncing?: boolean | Record<string, unknown>;
  peerCount?: number;
  nodeInfo?: string;
  epochSize?: number;
  errors?: Record<string, string>;
  checkedAt: string; // ISO timestamp
}

/**
 * Récupère l’état courant du réseau Celo via le nœud configuré.
 * Les erreurs par propriété sont collectées et renvoyées sans faire échouer l’ensemble.
 */
export async function getNetworkStatus(): Promise<CeloNetworkStatus> {
  const kit = newKit(BLOCKCHAIN_CONFIG.CELO_RPC_URL);
  const web3 = kit.connection.web3;
  const errors: Record<string, string> = {};

  // Vérifie la connexion basique
  try {
    await web3.eth.getBlockNumber();
  } catch (err) {
    return {
      connected: false,
      errors: { connection: (err as Error).message },
      checkedAt: new Date().toISOString(),
    };
  }

  const status: CeloNetworkStatus = {
    connected: true,
    checkedAt: new Date().toISOString(),
  };

  await Promise.all([
    (async () => {
      try { status.chainId = await web3.eth.getChainId(); } 
      catch (e) { errors.chainId = (e as Error).message; }
    })(),
    (async () => {
      try { status.networkId = await web3.eth.net.getId(); } 
      catch (e) { errors.networkId = (e as Error).message; }
    })(),
    (async () => {
      try { status.gasPriceWei = await web3.eth.getGasPrice(); } 
      catch (e) { errors.gasPriceWei = (e as Error).message; }
    })(),
    (async () => {
      try {
        const syncing = await web3.eth.isSyncing();
        status.syncing = typeof syncing === 'boolean' 
          ? syncing 
          : (syncing as unknown as Record<string, unknown>);
      } catch (e) { 
        errors.syncing = (e as Error).message; 
      }
    })(),
    (async () => {
      try { status.nodeInfo = await web3.eth.getNodeInfo(); } 
      catch (e) { errors.nodeInfo = (e as Error).message; }
    })(),
    (async () => {
      try { status.peerCount = await web3.eth.net.getPeerCount(); } 
      catch (e) { errors.peerCount = (e as Error).message; }
    })(),
    (async () => {
      try { status.epochSize = await kit.getEpochSize(); } 
      catch (e) { errors.epochSize = (e as Error).message; }
    })(),
  ]);

  // Bloc séparé pour le dernier bloc (dépend de getBlockNumber + getBlock)
  try {
    const latest = await web3.eth.getBlockNumber();
    status.latestBlockNumber = latest;
    try {
      const block = await web3.eth.getBlock(latest);
      status.latestBlockTimestamp = typeof block?.timestamp === 'string' 
        ? parseInt(block.timestamp, 10) 
        : (block?.timestamp as number | undefined);
    } catch (e) {
      errors.latestBlock = (e as Error).message;
    }
  } catch (e) {
    errors.latestBlockNumber = (e as Error).message;
  }

  if (Object.keys(errors).length) {
    status.errors = errors;
  }
  return status;
}
