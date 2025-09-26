"use strict";
// services/registration.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_1 = require("../../../config/firebase");
const libphonenumber_js_1 = require("libphonenumber-js");
const uuid_1 = require("uuid");
// Configuration des codes de vérification
const EMAIL_CODE_EXPIRY_MINUTES = 10;
const PHONE_CODE_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const CODE_RESEND_DELAY_SECONDS = 60;
const SESSION_EXPIRY_MINUTES = 30;
class RegistrationService {
    constructor() {
        this.init();
    }
    async init() {
        await firebase_1.firebaseInitPromise;
        this.db = firebase_admin_1.default.firestore();
    }
    // Génération d'un code à 6 chiffres
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // Validation du format email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Validation et normalisation du téléphone
    validateAndNormalizePhone(phone, country) {
        try {
            if (!(0, libphonenumber_js_1.isValidPhoneNumber)(phone, country)) {
                return null;
            }
            const phoneNumber = (0, libphonenumber_js_1.parsePhoneNumberWithError)(phone, country);
            return phoneNumber?.format('E.164') ?? null;
        }
        catch {
            return null;
        }
    }
    // Créer une session d'inscription
    async createUser(data) {
        const sessionId = (0, uuid_1.v4)();
        const now = firebase_admin_1.default.firestore.Timestamp.now();
        const session = {
            id: sessionId,
            step: 'email_verification',
            emailVerified: false,
            phoneVerified: false,
            emailAttempts: 0,
            phoneAttempts: 0,
            createdAt: now,
            updatedAt: now,
            ...data,
        };
        await this.db.collection('registration_sessions').doc(sessionId).set(session);
        return sessionId;
    }
    // Récupérer une session d'inscription
    async getUser(sessionId) {
        const doc = await this.db.collection('registration_sessions').doc(sessionId).get();
        return doc.exists ? doc.data() : null;
    }
    // Mettre à jour une session d'inscription
    async updateUser(sessionId, updates) {
        await this.db.collection('registration_sessions').doc(sessionId).update({
            ...updates,
            updatedAt: firebase_admin_1.default.firestore.Timestamp.now(),
        });
    }
    // Vérifier si une session est expirée
    isSessionExpired(session) {
        const now = Date.now();
        const sessionTime = session.updatedAt.toMillis();
        const maxAge = SESSION_EXPIRY_MINUTES * 60 * 1000;
        return (now - sessionTime) > maxAge;
    }
    // Vérifier si un code peut être renvoyé
    canResendCode(session) {
        if (!session.lastCodeSentAt)
            return true;
        const now = Date.now();
        const lastSent = session.lastCodeSentAt.toMillis();
        const minDelay = CODE_RESEND_DELAY_SECONDS * 1000;
        return (now - lastSent) > minDelay;
    }
    // Envoyer un email de vérification (simulation)
    async sendVerificationEmail(email, code) {
        // TODO: Intégrer avec un service d'email réel (SendGrid, AWS SES, etc.)
        // eslint-disable-next-line no-console
        console.log(`[EMAIL] Code de vérification pour ${email}: ${code}`);
        // Simulation d'envoi
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Envoyer un SMS de vérification (simulation)
    async sendVerificationSMS(phone, code) {
        // TODO: Intégrer avec Firebase Extensions SMS ou un service SMS
        // eslint-disable-next-line no-console
        console.log(`[SMS] Code de vérification pour ${phone}: ${code}`);
        // Simulation d'envoi
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // FLUX 1: Inscription par email
    async registerWithEmail(request) {
        try {
            const { email } = request;
            if (!email || !this.isValidEmail(email)) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_EMAIL',
                        message: 'Format d\'email invalide.',
                    },
                };
            }
            // Vérifier si l'email existe déjà
            try {
                await firebase_admin_1.default.auth().getUserByEmail(email);
                return {
                    success: false,
                    error: {
                        code: 'EMAIL_EXISTS',
                        message: 'Cet email est déjà utilisé.',
                    },
                };
            }
            catch (error) {
                // Si l'email n'existe pas, c'est bon
                if (error?.code !== 'auth/user-not-found') {
                    throw error;
                }
            }
            const verificationCode = this.generateVerificationCode();
            const expiry = firebase_admin_1.default.firestore.Timestamp.fromMillis(Date.now() + EMAIL_CODE_EXPIRY_MINUTES * 60 * 1000);
            const sessionId = await this.createUser({
                step: 'email_verification',
                email,
                emailVerificationCode: verificationCode,
                emailCodeExpiry: expiry,
                lastCodeSentAt: firebase_admin_1.default.firestore.Timestamp.now(),
            });
            await this.sendVerificationEmail(email, verificationCode);
            return {
                success: true,
                data: {
                    step: 'email_verification',
                    message: 'Code de vérification envoyé par email.',
                    sessionId,
                },
            };
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur lors de l\'inscription par email:', error);
            return {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            };
        }
    }
    // FLUX 2: Inscription via Google
    async registerWithGoogle(request) {
        try {
            const { googleToken } = request;
            if (!googleToken) {
                return {
                    success: false,
                    error: {
                        code: 'MISSING_TOKEN',
                        message: 'Token Google manquant.',
                    },
                };
            }
            // Vérifier le token Google
            const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(googleToken);
            const { email, uid } = decodedToken;
            if (!email) {
                return {
                    success: false,
                    error: {
                        code: 'NO_EMAIL',
                        message: 'Email non fourni par Google.',
                    },
                };
            }
            const sessionId = await this.createUser({
                step: 'phone_input',
                email,
                emailVerified: true,
                firebaseUid: uid,
            });
            return {
                success: true,
                data: {
                    step: 'phone_input',
                    message: 'Authentification Google réussie. ' +
                        'Ajoutez votre numéro de téléphone.',
                    sessionId,
                },
            };
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur lors de l\'inscription Google:', error);
            if (error?.code === 'auth/id-token-expired') {
                return {
                    success: false,
                    error: { code: 'TOKEN_EXPIRED', message: 'Token Google expiré.' },
                };
            }
            return {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            };
        }
    }
    // Vérification du code email
    async verifyEmail(request) {
        try {
            const { sessionId, code } = request;
            const session = await this.getUser(sessionId);
            if (!session) {
                return {
                    success: false,
                    error: { code: 'SESSION_NOT_FOUND', message: 'Session introuvable.' },
                };
            }
            if (this.isSessionExpired(session)) {
                return {
                    success: false,
                    error: { code: 'SESSION_EXPIRED', message: 'Session expirée.' },
                };
            }
            if (session.step !== 'email_verification') {
                return {
                    success: false,
                    error: { code: 'INVALID_STEP', message: 'Étape invalide.' },
                };
            }
            if (session.emailAttempts >= MAX_ATTEMPTS) {
                return {
                    success: false,
                    error: {
                        code: 'MAX_ATTEMPTS',
                        message: 'Nombre maximum de tentatives atteint.',
                    },
                };
            }
            const now = firebase_admin_1.default.firestore.Timestamp.now();
            if (!session.emailCodeExpiry ||
                now.toMillis() > session.emailCodeExpiry.toMillis()) {
                return {
                    success: false,
                    error: { code: 'CODE_EXPIRED', message: 'Code expiré.' },
                };
            }
            if (session.emailVerificationCode !== code) {
                await this.updateUser(sessionId, {
                    emailAttempts: session.emailAttempts + 1,
                });
                return {
                    success: false,
                    error: { code: 'INVALID_CODE', message: 'Code invalide.' },
                };
            }
            // Code valide, passer à l'étape suivante
            await this.updateUser(sessionId, {
                emailVerified: true,
                step: 'phone_input',
                emailVerificationCode: undefined,
                emailCodeExpiry: undefined,
                emailAttempts: 0,
            });
            return {
                success: true,
                data: {
                    step: 'phone_input',
                    message: 'Email vérifié avec succès. ' +
                        'Ajoutez votre numéro de téléphone.',
                    sessionId,
                },
            };
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur lors de la vérification email:', error);
            return {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            };
        }
    }
    // Ajout du numéro de téléphone
    async addPhone(request) {
        try {
            const { sessionId, phone, country, preferredCurrency } = request;
            const session = await this.getUser(sessionId);
            if (!session) {
                return {
                    success: false,
                    error: { code: 'SESSION_NOT_FOUND', message: 'Session introuvable.' },
                };
            }
            if (this.isSessionExpired(session)) {
                return {
                    success: false,
                    error: { code: 'SESSION_EXPIRED', message: 'Session expirée.' },
                };
            }
            if (session.step !== 'phone_input') {
                return {
                    success: false,
                    error: { code: 'INVALID_STEP', message: 'Étape invalide.' },
                };
            }
            if (!session.emailVerified && !session.firebaseUid) {
                return {
                    success: false,
                    error: {
                        code: 'EMAIL_NOT_VERIFIED',
                        message: 'Email non vérifié.',
                    },
                };
            }
            // Valider et normaliser le téléphone
            const normalizedPhone = this.validateAndNormalizePhone(phone, country);
            if (!normalizedPhone) {
                return {
                    success: false,
                    error: {
                        code: 'PHONE_INVALID',
                        message: 'Numéro de téléphone invalide.',
                    },
                };
            }
            // Vérifier si le téléphone existe déjà
            try {
                await firebase_admin_1.default.auth().getUserByPhoneNumber(normalizedPhone);
                return {
                    success: false,
                    error: {
                        code: 'PHONE_EXISTS',
                        message: 'Ce numéro est déjà utilisé.',
                    },
                };
            }
            catch (error) {
                // Vérification du code d'erreur
                const err = error;
                if (err.code !== 'auth/user-not-found') {
                    throw error;
                }
            }
            const verificationCode = this.generateVerificationCode();
            const expiry = firebase_admin_1.default.firestore.Timestamp.fromMillis(Date.now() + PHONE_CODE_EXPIRY_MINUTES * 60 * 1000);
            await this.updateUser(sessionId, {
                phone: normalizedPhone,
                country,
                preferredCurrency,
                phoneVerificationCode: verificationCode,
                phoneCodeExpiry: expiry,
                step: 'phone_verification',
                lastCodeSentAt: firebase_admin_1.default.firestore.Timestamp.now(),
                phoneAttempts: 0,
            });
            await this.sendVerificationSMS(normalizedPhone, verificationCode);
            return {
                success: true,
                data: {
                    step: 'phone_verification',
                    message: 'Code de vérification envoyé par SMS.',
                    sessionId,
                },
            };
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur lors de l\'ajout du téléphone:', error);
            return {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            };
        }
    }
    // Vérification finale et création du compte
    async verifyPhone(request) {
        const batch = this.db.batch();
        let createdFirebaseUser = false;
        let firebaseUid;
        try {
            const { sessionId, code } = request;
            const session = await this.getUser(sessionId);
            if (!session) {
                return {
                    success: false,
                    error: { code: 'SESSION_NOT_FOUND', message: 'Session introuvable.' },
                };
            }
            if (this.isSessionExpired(session)) {
                return {
                    success: false,
                    error: { code: 'SESSION_EXPIRED', message: 'Session expirée.' },
                };
            }
            if (session.step !== 'phone_verification') {
                return {
                    success: false,
                    error: { code: 'INVALID_STEP', message: 'Étape invalide.' },
                };
            }
            if (session.phoneAttempts >= MAX_ATTEMPTS) {
                return {
                    success: false,
                    error: {
                        code: 'MAX_ATTEMPTS',
                        message: 'Nombre maximum de tentatives atteint.',
                    },
                };
            }
            const now = firebase_admin_1.default.firestore.Timestamp.now();
            if (!session.phoneCodeExpiry ||
                now.toMillis() > session.phoneCodeExpiry.toMillis()) {
                return {
                    success: false,
                    error: { code: 'CODE_EXPIRED', message: 'Code expiré.' },
                };
            }
            if (session.phoneVerificationCode !== code) {
                await this.updateUser(sessionId, {
                    phoneAttempts: session.phoneAttempts + 1,
                });
                return {
                    success: false,
                    error: { code: 'INVALID_CODE', message: 'Code invalide.' },
                };
            }
            // Code valide, créer le compte complet
            try {
                // 1. Créer ou récupérer l'utilisateur Firebase Auth
                if (session.firebaseUid) {
                    // Cas Google - utilisateur déjà créé
                    firebaseUid = session.firebaseUid;
                    // Ajouter le numéro de téléphone
                    await firebase_admin_1.default.auth().updateUser(firebaseUid, {
                        phoneNumber: session.phone,
                    });
                }
                else {
                    // Cas email - créer l'utilisateur Firebase Auth
                    const userRecord = await firebase_admin_1.default.auth().createUser({
                        email: session.email,
                        phoneNumber: session.phone,
                        emailVerified: true,
                    });
                    firebaseUid = userRecord.uid;
                    createdFirebaseUser = true;
                }
                // 2. Créer le document utilisateur dans Firestore
                const userDoc = this.db.collection('users').doc(firebaseUid);
                batch.set(userDoc, {
                    id: firebaseUid,
                    email: session.email,
                    phone: session.phone,
                    country: session.country,
                    preferredCurrencyId: session.preferredCurrency ?? 'EUR',
                    kycLevelId: 'L1',
                    statusId: 'ACTIVE',
                    twoFAEnabled: false,
                    deviceIds: [],
                    lastLoginAt: now,
                    riskScore: 0,
                    createdAt: now,
                    updatedAt: now,
                });
                // 3. Marquer la session comme complétée
                const sessionDoc = this.db
                    .collection('registration_sessions')
                    .doc(sessionId);
                batch.update(sessionDoc, {
                    step: 'completed',
                    phoneVerified: true,
                    updatedAt: now,
                });
                // Exécuter la transaction
                await batch.commit();
                return {
                    success: true,
                    data: {
                        step: 'completed',
                        message: 'Inscription terminée avec succès.',
                        sessionId,
                    },
                };
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error('Erreur lors de la création du compte:', error);
                // Rollback en cas d'échec
                if (createdFirebaseUser && firebaseUid) {
                    try {
                        await firebase_admin_1.default.auth().deleteUser(firebaseUid);
                        // eslint-disable-next-line no-console
                        console.log(`Rollback: Utilisateur Firebase ${firebaseUid} supprimé`);
                    }
                    catch (rollbackError) {
                        // eslint-disable-next-line no-console
                        console.error('Erreur lors du rollback Firebase Auth:', rollbackError);
                    }
                }
                return {
                    success: false,
                    error: {
                        code: 'ACCOUNT_CREATION_FAILED',
                        message: 'Échec de la création du compte.',
                    },
                };
            }
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur lors de la vérification du téléphone:', error);
            return {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            };
        }
    }
    // Récupérer le statut d'une inscription
    async getRegistrationStatus(sessionId) {
        try {
            const session = await this.getUser(sessionId);
            if (!session) {
                return {
                    success: false,
                    error: { code: 'SESSION_NOT_FOUND', message: 'Session introuvable.' },
                };
            }
            if (this.isSessionExpired(session)) {
                return {
                    success: false,
                    error: { code: 'SESSION_EXPIRED', message: 'Session expirée.' },
                };
            }
            return {
                success: true,
                data: {
                    step: session.step,
                    message: `Étape actuelle: ${session.step}`,
                    sessionId,
                },
            };
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur lors de la récupération du statut:', error);
            return {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
            };
        }
    }
    // Nettoyage des sessions expirées (à exécuter périodiquement)
    async cleanExpiredSessions() {
        try {
            const expiredTime = firebase_admin_1.default.firestore.Timestamp.fromMillis(Date.now() - SESSION_EXPIRY_MINUTES * 60 * 1000);
            const expiredSessions = await this.db
                .collection('registration_sessions')
                .where('updatedAt', '<', expiredTime)
                .get();
            const batch = this.db.batch();
            expiredSessions.docs.forEach(doc => {
                const ref = doc.ref;
                batch.delete(ref);
            });
            await batch.commit();
            // eslint-disable-next-line no-console
            console.log(`${expiredSessions.size} sessions expirées supprimées`);
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Erreur lors du nettoyage des sessions:', error);
        }
    }
}
exports.default = new RegistrationService();
