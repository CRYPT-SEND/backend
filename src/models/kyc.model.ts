import { Timestamp } from 'firebase-admin/firestore';

export interface KYCDocument {
  typeId: string; // Référence à KYCDocumentTypeModel
  url: string;
  statusId: string; // Référence à KYCStatusModel
  uploadedAt: Timestamp;
  reviewedAt?: Timestamp;
  rejectionReason?: string;
}


export interface KYCProfile {
  id: string;
  userId: string;
  levelId: string; // Référence à KYCLevelModel
  statusId: string; // Référence à KYCStatusModel
  documents: KYCDocument[];
  limits: {
    dailyLimit: number,
    monthlyLimit: number,
    yearlyLimit: number,
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
  levelId: string;
  documents?: KYCDocument[];
}

export interface UpdateKYCProfileData {
  levelId?: string;
  statusId?: string;
  documents?: KYCDocument[];
  pepScreened?: boolean;
  sanctionsScreened?: boolean;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  expiresAt?: Timestamp;
  notes?: string;
}