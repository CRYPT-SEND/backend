// routes/auth.routes.ts (Version mise à jour)

import { Router, Request, Response } from 'express';
import * as authController from './auth.controller';
const router = Router();

// Endpoint de base
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'AuthService',
    timestamp: new Date(),
    message: 'Authentication service is running',
  });
});

// ==================== NOUVELLES ROUTES D'INSCRIPTION MULTI-ÉTAPES ====================

// FLUX 1: Inscription par email
router.post('/register/email', authController.registerEmail);

// FLUX 2: Inscription via Google
router.post('/register/google', authController.registerGoogle);

// Vérification du code email (étape 2 du flux email)
router.post('/verify-email', authController.verifyEmail);

// Ajout du numéro de téléphone (étape 3 des deux flux)
router.post('/add-phone', authController.addPhone);

// Vérification finale du téléphone (étape 4 des deux flux)
// router.post('/verify-phone', authController.verifyPhone);

// Récupération du statut d'une inscription en cours
router.get('/registration-status/:sessionId', authController.getRegistrationStatus);

// ==================== ROUTES EXISTANTES (CONSERVÉES) ====================

// Ancien endpoint d'inscription (déprécié mais conservé pour compatibilité)
router.post('/register', authController.register);

// Routes d'authentification existantes
router.post('/logout', authController.logout)
  .use(authController.authenticateFirebaseToken);

// Routes 2FA
router.post('/2fa/verify', authController.twofaVerify)
  .use(authController.authenticateFirebaseToken);
router.post('/2fa/setup', authController.twofaSetup)
  .use(authController.authenticateFirebaseToken);

// Routes KYC
router.get('/kyc/profile', authController.kycProfile)
  .use(authController.authenticateFirebaseToken);
router.get('/kyc/documents', authController.kycDocuments)
  .use(authController.authenticateFirebaseToken);

// Route protégée d'exemple
router.get('/profile', authController.authenticateFirebaseToken, authController.getProfile);

export default router;