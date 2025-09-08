import { Timestamp } from 'firebase-admin/firestore';

export type WalletBalance = Record<string, number>;

export interface Wallet {
  id: string;
  userId: string;
  typeId: string; // Référence à WalletTypeModel
  networkId: string; // Référence à NetworkModel
  address: string;
  encryptedPrivateKey?: string;
  keyDerivationPath?: string;
  balance: WalletBalance;
  statusId: string; // Référence à WalletStatusModel
  createdAt: Timestamp;
  lastSyncAt: Timestamp;
}

export interface CreateWalletData {
  userId: string;
  typeId: string;
  networkId: string;
  address: string;
  encryptedPrivateKey?: string;
  keyDerivationPath?: string;
}
