import { CollectionReference } from 'firebase-admin/firestore';
import { User } from './user.model';
import { KYCProfile } from './kyc.model';
import { Wallet } from './wallet.model';
import { Quote, TransferOrder } from './payment.model';
import { FiatTransaction, CryptoTransaction } from './transaction.model';
import { LedgerEntry, Notification, AuditLog, RateLimit } from './audit.model';
import {
} from './enum.model';
import { EnumValue } from './enum.model';
export interface DatabaseSchema {
  users: CollectionReference<User>;
  kyc_profiles: CollectionReference<KYCProfile>;
  wallets: CollectionReference<Wallet>;
  quotes: CollectionReference<Quote>;
  transfer_orders: CollectionReference<TransferOrder>;
  fiat_transactions: CollectionReference<FiatTransaction>;
  crypto_transactions: CollectionReference<CryptoTransaction>;
  ledger_entries: CollectionReference<LedgerEntry>;
  notifications: CollectionReference<Notification>;
  audit_logs: CollectionReference<AuditLog>;
  rate_limits: CollectionReference<RateLimit>;

  // Collections d'énumération modifiables par l'admin
  currencies: CollectionReference<EnumValue>;
  networks: CollectionReference<EnumValue>;
  payment_methods: CollectionReference<EnumValue>;
  kyc_levels: CollectionReference<EnumValue>;
  kyc_statuses: CollectionReference<EnumValue>;
  user_statuses: CollectionReference<EnumValue>;
  order_statuses: CollectionReference<EnumValue>;
  wallet_types: CollectionReference<EnumValue>;
  wallet_statuses: CollectionReference<EnumValue>;
}