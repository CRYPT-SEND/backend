import { Timestamp } from 'firebase-admin/firestore';

export type Currency = 'XAF' | 'USD' | 'EUR' | 'BTC' | 'ETH' | 'USDT';
export type Network = 'ETHEREUM' | 'BITCOIN' | 'POLYGON' | 'BSC';
export type PaymentMethod = 'OM' | 'MTN' | 'BANK' | 'CRYPTO';

export enum KYCLevel {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3'
}

export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED'
}

export enum OrderStatus {
  CREATED = 'CREATED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum WalletType {
  CUSTODIAL = 'custodial',
  SEMI_CUSTODIAL = 'semi_custodial'
}

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FROZEN = 'FROZEN'
}

export const KYC_LIMITS = {
  L1: {
    dailyLimit: 50000,      // 50k XAF
    monthlyLimit: 200000,   // 200k XAF
    yearlyLimit: 1000000    // 1M XAF
  },
  L2: {
    dailyLimit: 300000,     // 300k XAF
    monthlyLimit: 1500000,  // 1.5M XAF
    yearlyLimit: 10000000   // 10M XAF
  },
  L3: {
    dailyLimit: 1000000,    // 1M XAF
    monthlyLimit: 5000000,  // 5M XAF
    yearlyLimit: 50000000   // 50M XAF
  }
} as const;
