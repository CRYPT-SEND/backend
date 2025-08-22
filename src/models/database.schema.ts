import { CollectionReference } from 'firebase-admin/firestore';
import { User } from './user.model';
import { KYCProfile } from './kyc.model';
import { Wallet } from './wallet.model';
import { Quote, TransferOrder } from './payment.model';
import { FiatTransaction, CryptoTransaction } from './transaction.model';
import { LedgerEntry } from './audit.model';
import { Notification } from './audit.model';
import { AuditLog } from './audit.model';
import { RateLimit } from './audit.model';
export interface DatabaseSchema {
  users: CollectionReference<User>;
  kyc_profiles: CollectionReference<KYCProfile>;
  wallets: CollectionReference<Wallet>;
  payment_methods: CollectionReference<any>; // À définir selon vos besoins
  quotes: CollectionReference<Quote>;
  transfer_orders: CollectionReference<TransferOrder>;
  fiat_transactions: CollectionReference<FiatTransaction>;
  crypto_transactions: CollectionReference<CryptoTransaction>;
  ledger_entries: CollectionReference<LedgerEntry>;
  notifications: CollectionReference<Notification>;
  audit_logs: CollectionReference<AuditLog>;
  rate_limits: CollectionReference<RateLimit>;
}