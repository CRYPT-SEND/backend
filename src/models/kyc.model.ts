import { KYCLevel,KYCStatus,KYC_LIMITS } from "./types";
import { Timestamp } from "firebase-admin/firestore";

export interface KYCDocument {
  type: 'ID' | 'PASSPORT' | 'DRIVING_LICENSE' | 'PROOF_OF_ADDRESS' | 'INCOME_PROOF';
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: Timestamp;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
}

export interface KYCProfile {
  id: string;
  userId: string;
  level: KYCLevel;
  status: KYCStatus;
  documents: KYCDocument[];
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    yearlyLimit: number;
  };
  pepScreened: boolean;
  sanctionsScreened: boolean;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  expiresAt?: Timestamp;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateKYCProfileData {
  userId: string;
  level: KYCLevel;
  documents?: KYCDocument[];
}

export interface UpdateKYCProfileData {
  level?: KYCLevel;
  status?: KYCStatus;
  documents?: KYCDocument[];
  pepScreened?: boolean;
  sanctionsScreened?: boolean;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  expiresAt?: Timestamp;
  notes?: string;
}