import { Currency } from './types';
import { Timestamp } from 'firebase-admin/firestore';

export interface LedgerEntry {
  id: string;
  userId: string;
  orderId?: string;
  type: 'DEBIT' | 'CREDIT';
  currency: Currency;
  amount: number;
  balance: number; // Solde après transaction
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Timestamp;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  channel: string;
  subject: string;
  content: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  retryCount: number;
  scheduledAt: Timestamp;
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  metadata: Record<string, unknown>;
}

export interface RateLimit {
  id: string;
  userId: string;
  action: string;
  count: number;
  windowStart: Timestamp;
  windowEnd: Timestamp;
  limit: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
