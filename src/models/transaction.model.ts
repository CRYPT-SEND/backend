import { Currency, Network, PaymentMethod } from './types';
import { Timestamp } from 'firebase-admin/firestore';

export interface FiatTransaction {
  id: string;
  userId: string;
  orderId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE';
  currency: Currency;
  amount: number;
  fees: number;
  netAmount: number;
  method: PaymentMethod;
  externalId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  metadata: Record<string, any>;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface CryptoTransaction {
  id: string;
  userId: string;
  orderId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE';
  network: Network;
  currency: Currency;
  amount: number;
  fees: number;
  netAmount: number;
  fromAddress?: string;
  toAddress: string;
  txHash?: string;
  blockHeight?: number;
  confirmations: number;
  requiredConfirmations: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  metadata: Record<string, any>;
  createdAt: Timestamp;
  confirmedAt?: Timestamp;
}
