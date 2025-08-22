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
  metadata: Record<string, any>;
  createdAt: Timestamp;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
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
  metadata: Record<string, any>;
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
