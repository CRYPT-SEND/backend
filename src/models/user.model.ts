// On utilise des références vers les modèles d'énumération modifiables
// import { CurrencyModel, KYCLevelModel, UserStatusModel } from './enum.model';
import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  id: string;
  phone: string;
  email: string;
  passwordHash: string;
  country: string;
  preferredCurrencyId: string; // Référence à CurrencyModel
  kycLevelId: string; // Référence à KYCLevelModel
  statusId: string; // Référence à UserStatusModel
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
  preferredCurrencyId?: string;
}

export interface UpdateUserData {
  email?: string;
  country?: string;
  preferredCurrencyId?: string;
  twoFAEnabled?: boolean;
  twoFASecret?: string;
  statusId?: string;
  riskScore?: number;
}