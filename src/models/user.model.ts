// types/registration.types.ts

import { Timestamp } from 'firebase-admin/firestore';

export interface User {
  id: string;
  step: 'email_verification' | 'phone_input' | 'phone_verification' | 'completed';
  email?: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  country?: string;
  preferredCurrency?: string;
  emailVerificationCode?: string;
  phoneVerificationCode?: string;
  emailCodeExpiry?: Timestamp;
  phoneCodeExpiry?: Timestamp;
  emailAttempts: number;
  phoneAttempts: number;
  lastCodeSentAt?: Timestamp;
  firebaseUid?: string; // Pour le cas Google
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VerificationCode {
  code: string;
  expiry: Timestamp;
  attempts: number;
  type: 'email' | 'phone';
}

export interface RegistrationResponse {
  success: boolean;
  data?: {
    step: string,
    message: string,
    sessionId: string,
  };
  error?: {
    code: string,
    message: string,
  };
}

export interface EmailRegistrationRequest {
  email: string;
}

export interface GoogleRegistrationRequest {
  googleToken: string;
}

export interface VerifyEmailRequest {
  sessionId: string;
  code: string;
}

export interface AddPhoneRequest {
  sessionId: string;
  phone: string;
  country: string;
  preferredCurrency?: string;
}

export interface VerifyPhoneRequest {
  sessionId: string;
  code: string;
}