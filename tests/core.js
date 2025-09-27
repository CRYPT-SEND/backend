"use strict";
// /* eslint-disable no-console */
// import { describe, it, expect, beforeAll } from 'vitest';
// import admin from 'firebase-admin';
// import { registerUserWithWallet } from '../src/services/core/core.service';
// import registrationService from '../src/services/auth/registration.service';
// // Types pour les données de session
// interface SessionData {
//   emailVerificationCode?: string;
//   phoneVerificationCode?: string;
// }
// interface WalletData {
//   id: string;
//   userId: string;
//   address: string;
//   statusId: string;
//   createdAt?: admin.firestore.Timestamp | string;
// }
// // Helper to create a full registration flow payload
// async function createCompletedRegistrationSession() {
//   // 1) Start with email
//   const email = `user_${Date.now()}@test.com`;
//   const reg1 = await registrationService.registerWithEmail({ email });
//   expect(reg1.success).toBe(true);
//   const sessionId = reg1.data?.sessionId ?? '';
//   console.log('\n[TEST] registerWithEmail ->', { 
//     sessionId, 
//     email, 
//     step: reg1.data?.step,
//   });
//   // Read code from DB (tests are allowed to touch local emulator/real
//   const sessionDoc = await admin.firestore()
//     .collection('registration_sessions')
//     .doc(sessionId)
//     .get();
//   const session = sessionDoc.data() as SessionData;
//   const emailCode = session.emailVerificationCode ?? '';
//   console.log('[TEST] emailVerificationCode ->', emailCode);
//   // 2) Verify email
//   const reg2 = await registrationService.verifyEmail({ 
//     sessionId, 
//     code: emailCode,
//   });
//   expect(reg2.success).toBe(true);
//   console.log('[TEST] verifyEmail ->', { 
//     success: reg2.success, 
//     step: reg2.data?.step,
//   });
//   // 3) Add phone
//   // Utilise un numéro unique pour éviter PHONE_EXISTS
//   const randomNum = Math.floor(10000000 + Math.random() * 89999999);
//   const phone = '+336' + randomNum.toString();
//   const reg3 = await registrationService.addPhone({
//     sessionId,
//     phone,
//     country: 'FR',
//     preferredCurrency: 'EUR',
//   });
//   expect(reg3.success).toBe(true);
//   console.log('[TEST] addPhone ->', { 
//     success: reg3.success, 
//     step: reg3.data?.step, 
//     phone,
//   });
//   // Get the phone code
//   const sessionDoc2 = await admin.firestore()
//     .collection('registration_sessions')
//     .doc(sessionId)
//     .get();
//   const session2 = sessionDoc2.data() as SessionData;
//   const phoneCode = session2.phoneVerificationCode ?? '';
//   console.log('[TEST] phoneVerificationCode ->', phoneCode);
//   return { sessionId, phoneCode };
// }
// describe('Core Service - registerUserWithWallet', () => {
//   beforeAll(async () => {
//     // ensure firestore is initialized via config.ts setup file
//   });
//   it('creates a Firebase user and a linked wallet after phone ' +
//     'verification', async () => {
//     const { sessionId, phoneCode } = 
//       await createCompletedRegistrationSession();
//     const result = await registerUserWithWallet({ 
//       sessionId, 
//       code: phoneCode,
//     });
//     expect(result.registration.success).toBe(true);
//     expect(result.wallet).toBeDefined();
//     expect(result.wallet.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
//     expect(result.wallet.encryptedPrivateKey).toMatch(/^[0-9a-f]+:/);
//     console.log('[TEST] registerUserWithWallet ->', {
//       registrationStep: result.registration.data?.step,
//       wallet: {
//         id: result.wallet.id,
//         userId: result.wallet.userId,
//         address: result.wallet.address,
//         encryptedPrivateKeyPreview: 
//           String(result.wallet.encryptedPrivateKey).slice(0, 12) + 
//           '...',
//       },
//     });
//     // Wallet should be persisted
//     const walletSnap = await admin.firestore()
//       .collection('wallets')
//       .doc(result.wallet.id)
//       .get();
//     expect(walletSnap.exists).toBe(true);
//     const walletDoc = walletSnap.data() as WalletData;
//     const createdAt = walletDoc.createdAt;
//     const createdAtStr = createdAt && 
//       typeof createdAt === 'object' && 
//       'toDate' in createdAt
//       ? (createdAt)
//         .toDate()
//         .toISOString()
//       : createdAt;
//     console.log('[TEST] persisted wallet ->', {
//       id: walletDoc.id,
//       userId: walletDoc.userId,
//       address: walletDoc.address,
//       statusId: walletDoc.statusId,
//       createdAt: createdAtStr,
//     });
//   }, 20000);
// });
