import { Currency, KYCLevel, UserStatus } from './types';
import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  id: string;
  phone: string;
  email: string;
  passwordHash: string;
  country: string;
  preferredCurrency: Currency;
  kycLevel: KYCLevel;
  status: UserStatus;
  twoFAEnabled: boolean;
  twoFASecret?: string;
  deviceIds: string[];
  lastLoginAt: Timestamp;
  riskScore: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateUserData {
  phone: string;
  email: string;
  passwordHash: string;
  country: string;
  preferredCurrency?: Currency;
}

export interface UpdateUserData {
  email?: string;
  country?: string;
  preferredCurrency?: Currency;
  twoFAEnabled?: boolean;
  twoFASecret?: string;
  status?: UserStatus;
  riskScore?: number;
}