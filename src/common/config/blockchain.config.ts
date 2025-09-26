/* eslint-disable n/no-process-env */

/**
 * Configuration centralisée pour le service blockchain
 * Centralise toutes les variables d'environnement et constantes
 */

// Variables d'environnement Celo/Blockchain
export const BLOCKCHAIN_CONFIG = {
  // URL du nœud Celo (par défaut Alfajores testnet)
  CELO_RPC_URL: process.env.CELO_RPC_URL_TEST ?? 'https://alfajores-forno.celo-testnet.org',
  
  // Adresse du contrat cUSD sur Alfajores
  CUSD_ADDRESS: process.env.CUSD_ADDRESS_TEST ?? '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  
  // Configuration du chiffrement
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ?? '',
} as const;

// ABI ERC20 minimal typé correctement
export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'transfer', 
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: 'decimals', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const;

// Types pour les méthodes du contrat
export interface ContractMethods {
  balanceOf: (address: string) => {
    call: () => Promise<string>,
  };
  transfer: (to: string, amount: string) => {
    estimateGas: (options: { from: string }) => Promise<number>,
    send: (options: { 
      from: string, 
      gas: number, 
      feeCurrency: string,
    }) => Promise<{ transactionHash: string }>,
  };
  decimals: () => {
    call: () => Promise<string>,
  };
}