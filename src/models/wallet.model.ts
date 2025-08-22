import { Network, WalletStatus, WalletType } from './types';
import { Timestamp } from 'firebase-admin/firestore';

export interface WalletBalance {
  [currency: string]: number;
}

export interface Wallet {
  id: string;
  userId: string;
  type: WalletType;
  network: Network;
  address: string;
  encryptedPrivateKey?: string;
  keyDerivationPath?: string;
  balance: WalletBalance;
  status: WalletStatus;
  createdAt: Timestamp;
  lastSyncAt: Timestamp;
}

export interface CreateWalletData {
  userId: string;
  type: WalletType;
  network: Network;
  address: string;
  encryptedPrivateKey?: string;
  keyDerivationPath?: string;
}
