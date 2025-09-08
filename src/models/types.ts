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

// export const KYC_LIMITS = {
// Les limites KYC doivent être stockées en base et modifiables par l'admin.

export interface KYCLevelLimit {
  level: string; // 'L1', 'L2', 'L3', etc.
  dailyLimit: number;
  monthlyLimit: number;
  yearlyLimit: number;
  updatedAt: Date;
}
