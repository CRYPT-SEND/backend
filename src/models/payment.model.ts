import { Currency, PaymentMethod, OrderStatus } from './types';
import { Timestamp } from 'firebase-admin/firestore';
export interface Quote {
  id: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
  toAmountEstimated: number;
  exchangeRate: number;
  fees: {
    fixed: number,
    percent: number,
    network: number,
    total: number,
  };
  marginBps: number;
  slippageMaxBps: number;
  lockedRate: boolean;
  expiresAt: Timestamp;
  source: string;
  corridor: string;
  idempotencyKey: string;
  signature: string;
  createdAt: Timestamp;
}

export interface OrderEvent {
  status: OrderStatus;
  timestamp: Timestamp;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ReceiverDetails {
  method: PaymentMethod;
  details: unknown; // Spécifique à chaque méthode
}

export interface TransferOrder {
  id: string;
  userId: string;
  quoteId: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
  toAmountTarget: number;
  feeTotal: number;
  status: OrderStatus;
  receiver: ReceiverDetails;
  timeline: OrderEvent[];
  reasonCode?: string;
  correlationId: string;
  retryCount: number;
  lastError?: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
