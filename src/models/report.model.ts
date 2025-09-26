import { FirestoreDataConverter, Timestamp } from 'firebase-admin/firestore';

export type ReportStatus = 'pending' | 'scheduled' | 'running' | 'done' | 'failed';

export interface Report {
  id?: string; // facultatif en local, Firestore utilisera doc id
  name: string;
  description?: string;
  type: 'financial' | 'transactions' | 'summary' | 'celo_analytics' | string;
  format: 'csv' | 'pdf' | 'csv+pdf';
  filters?: Record<string, any>; // ex: { from: '2025-09-01', to: '2025-09-19', addresses: [...] }
  schedule?: string | null; // cron expression (ex: "0 2 * * *") ou null
  nextRunAt?: Timestamp | null; // optionnel : prochain run calculé
  status: ReportStatus;
  fileUrls?: { csv?: string; pdf?: string } | null; // URLs signées (Storage / S3)
  createdBy?: string; // admin user id
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  attemptCount?: number; // pour retry
  error?: string | null; // message d'erreur si failed
}
