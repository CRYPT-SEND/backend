// // tests/registration.test.ts
// import { describe, it, expect, beforeEach } from 'vitest';
// import { faker } from '@faker-js/faker';
// import registrationService from '../src/services/auth/registration.service';

// describe('Registration Service', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });
  
//   // Flux 1: Email -> Vérification email -> Téléphone -> Vérification téléphone
//   it('should complete email registration flow successfully', async () => {
//     // ÉTAPE 1: Inscription avec email
//     const email = faker.internet.email();
//     const password = faker.internet.password({ length: 12 });
    
//     const step1Result = await registrationService.registerWithEmail({
//       email,
//     //   password,
//     });
    
//     expect(step1Result.success).toBe(true);
//     expect(step1Result.data?.sessionId).toBeDefined();
//     expect(step1Result.data?.step).toBe('email_verification');
    
//     const sessionId = step1Result.data?.sessionId as string;
    
//     // ÉTAPE 2: Vérification de l'email
//     const verificationCode = '123456'; // Code simulé dans le mock
//     const step2Result = await registrationService.verifyEmail({
//       sessionId,
//       code: verificationCode
//     });
    
//     expect(step2Result.success).toBe(true);
//     expect(step2Result.data?.step).toBe('phone_input');
    
//     // ÉTAPE 3: Ajout du numéro de téléphone
//     const phone = faker.phone.number();
//     const country = faker.location.countryCode('alpha-2');
    
//     const step3Result = await registrationService.addPhone({
//       sessionId,
//       phone,
//       country,
//       preferredCurrency: 'EUR'
//     });
    
//     expect(step3Result.success).toBe(true);
//     expect(step3Result.data?.step).toBe('phone_verification');
    
//     // ÉTAPE 4: Vérification du téléphone et finalisation
//     const phoneVerificationCode = '654321'; // Code simulé dans le mock
//     const step4Result = await registrationService.verifyPhone({
//       sessionId,
//       code: phoneVerificationCode
//     });
    
//     expect(step4Result.success).toBe(true);
//     expect(step4Result.data?.step).toBe('completed');
//   });
  
//   // Flux 2: Google -> Téléphone -> Vérification téléphone
//   it('should complete Google registration flow successfully', async () => {
//     // ÉTAPE 1: Inscription avec Google
//     const googleToken = 'valid-google-token-mock';
//     const step1Result = await registrationService.registerWithGoogle({
//       googleToken
//     });
    
//     expect(step1Result.success).toBe(true);
//     expect(step1Result.data?.sessionId).toBeDefined();
//     expect(step1Result.data?.step).toBe('phone_input');
    
//     const sessionId = step1Result.data?.sessionId as string;
    
//     // ÉTAPE 2: Ajout du numéro de téléphone
//     const phone = faker.phone.number();
//     const country = faker.location.countryCode('alpha-2');
    
//     const step2Result = await registrationService.addPhone({
//       sessionId,
//       phone,
//       country,
//       preferredCurrency: 'EUR'
//     });
    
//     expect(step2Result.success).toBe(true);
//     expect(step2Result.data?.step).toBe('phone_verification');
    
//     // ÉTAPE 3: Vérification du téléphone et finalisation
//     const phoneVerificationCode = '654321'; // Code simulé dans le mock
//     const step3Result = await registrationService.verifyPhone({
//       sessionId,
//       code: phoneVerificationCode
//     });
    
//     expect(step3Result.success).toBe(true);
//     expect(step3Result.data?.step).toBe('completed');
//   });
  
//   // Test de récupération du statut
//   it('should get registration status', async () => {
//     // D'abord créer une session
//     const email = faker.internet.email();
//     const step1Result = await registrationService.registerWithEmail({
//       email,
//     //   password: faker.internet.password({ length: 12 })
//     });
    
//     const sessionId = step1Result.data?.sessionId as string;
    
//     // Ensuite récupérer son statut
//     const statusResult = await registrationService.getRegistrationStatus(sessionId);
    
//     expect(statusResult.success).toBe(true);
//     expect(statusResult.data?.step).toBe('email_verification');
//   });
  
//   // Test d'erreur
//   it('should handle invalid email format', async () => {
//     const result = await registrationService.registerWithEmail({
//       email: 'not-an-email',
//     //   password: 'Password123!'
//     });
    
//     expect(result.success).toBe(false);
//     expect(result.error?.code).toBe('INVALID_EMAIL');
//   });
  
//   // Test d'erreur téléphone
//   it('should handle invalid phone number', async () => {
//     // Créer une session valide
//     const step1Result = await registrationService.registerWithEmail({
//       email: faker.internet.email(),
//     //   password: faker.internet.password({ length: 12 })
//     });
    
//     const sessionId = step1Result.data?.sessionId as string;
    
//     // Vérifier le code pour avancer à l'étape phone_input
//     await registrationService.verifyEmail({
//       sessionId,
//       code: '123456' // Mock code
//     });
    
//     // Tester avec un numéro invalide
//     const result = await registrationService.addPhone({
//       sessionId,
//       phone: 'not-a-phone',
//       country: 'FR'
//     });
    
//     expect(result.success).toBe(false);
//     expect(result.error?.code).toBe('INVALID_STEP');
//   });
// });