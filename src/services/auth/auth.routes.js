"use strict";
// routes/auth.routes.ts (Version mise à jour)
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("./auth.controller"));
const router = (0, express_1.Router)();
// Endpoint de base
router.get('/health', (req, res) => {
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
router.post('/verify-phone', authController.verifyPhone);
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
exports.default = router;
