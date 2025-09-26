// services/registration.service.ts

import admin from 'firebase-admin';
import { firebaseInitPromise } from '../../../config/firebase';
import { 
  parsePhoneNumberWithError, 
  isValidPhoneNumber, 
  CountryCode, 
} from 'libphonenumber-js';
import { randomUUID } from 'crypto';
import {
  User,
  RegistrationResponse,
  EmailRegistrationRequest,
  GoogleRegistrationRequest,
  VerifyEmailRequest,
  AddPhoneRequest,
  VerifyPhoneRequest,
} from '../../models/user.model';

// Configuration des codes de vérification
const EMAIL_CODE_EXPIRY_MINUTES = 10;
const PHONE_CODE_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const CODE_RESEND_DELAY_SECONDS = 60;
const SESSION_EXPIRY_MINUTES = 30;

class RegistrationService {
  private db!: FirebaseFirestore.Firestore;
  private ready: Promise<void>;

  public constructor() {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    await firebaseInitPromise;
    this.db = admin.firestore();
  }

  private async ensureReady(): Promise<void> {
    await this.ready;
  }

  // Génération d'un code à 6 chiffres
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validation du format email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validation et normalisation du téléphone
  private validateAndNormalizePhone(
    phone: string, 
    country: string,
  ): string | null {
    try {
      if (!isValidPhoneNumber(phone, country as CountryCode)) {
        return null;
      }
      const phoneNumber = parsePhoneNumberWithError(
        phone, 
        country as CountryCode,
      );
      return phoneNumber?.format('E.164') ?? null;
    } catch {
      return null;
    }
  }

  // Créer une session d'inscription
  private async createUser(data: Partial<User>): Promise<string> {
    const sessionId = randomUUID();
    const now = admin.firestore.Timestamp.now();
    
    const session: User = {
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

  // Récupérer une session d'inscription - Méthode publique pour 
  // core.service.ts
  public async getUser(sessionId: string): Promise<User | null> {
    const doc = await this.db.collection('registration_sessions').doc(sessionId).get();
    return doc.exists ? doc.data() as User : null;
  }

  // Mettre à jour une session d'inscription
  private async updateUser(
    sessionId: string, 
    updates: Partial<User>,
  ): Promise<void> {
    // Firestore n'accepte pas `undefined` dans update().
    // On filtre donc les clés dont la valeur est undefined avant update.
    const sanitizedEntries = Object.entries(updates)
      .filter(([, value]) => value !== undefined);
    const sanitized = Object.fromEntries(sanitizedEntries) as Partial<User>;

    await this.db.collection('registration_sessions').doc(sessionId).update({
      ...sanitized,
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }

  // Vérifier si une session est expirée
  private isSessionExpired(session: User): boolean {
    const now = Date.now();
    const sessionTime = session.updatedAt.toMillis();
    const maxAge = SESSION_EXPIRY_MINUTES * 60 * 1000;
    return (now - sessionTime) > maxAge;
  }

  // Vérifier si un code peut être renvoyé
  private canResendCode(session: User): boolean {
    if (!session.lastCodeSentAt) return true;
    
    const now = Date.now();
    const lastSent = session.lastCodeSentAt.toMillis();
    const minDelay = CODE_RESEND_DELAY_SECONDS * 1000;
    return (now - lastSent) > minDelay;
  }

  // Envoyer un email de vérification (simulation)
  private async sendVerificationEmail(
    email: string, 
    code: string,
  ): Promise<void> {
    // TODO: Intégrer avec un service d'email réel (SendGrid, AWS SES, etc.)
    // eslint-disable-next-line no-console
    console.log(`[EMAIL] Code de vérification pour ${email}: ${code}`);
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Envoyer un SMS de vérification (simulation)
  private async sendVerificationSMS(
    phone: string, 
    code: string,
  ): Promise<void> {
    // TODO: Intégrer avec un service SMS (Firebase Extensions SMS ou autre)
    // eslint-disable-next-line no-console
    console.log(`[SMS] Code de vérification pour ${phone}: ${code}`);
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // FLUX 1: Inscription par email
  public async registerWithEmail(
    request: EmailRegistrationRequest,
  ): Promise<RegistrationResponse> {
    try {
      await this.ensureReady();
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
        await admin.auth().getUserByEmail(email);
        return {
          success: false,
          error: { 
            code: 'EMAIL_EXISTS', 
            message: 'Cet email est déjà utilisé.', 
          },
        };
      } catch (error: unknown) {
        // Si l'email n'existe pas, c'est bon
        if ((error as { code?: string })?.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      const verificationCode = this.generateVerificationCode();
      const expiry = admin.firestore.Timestamp.fromMillis(
        Date.now() + EMAIL_CODE_EXPIRY_MINUTES * 60 * 1000,
      );

      const sessionId = await this.createUser({
        step: 'email_verification',
        email,
        emailVerificationCode: verificationCode,
        emailCodeExpiry: expiry,
        lastCodeSentAt: admin.firestore.Timestamp.now(),
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

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de l\'inscription par email:', error);
      return {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      };
    }
  }

  // FLUX 2: Inscription via Google
  public async registerWithGoogle(
    request: GoogleRegistrationRequest,
  ): Promise<RegistrationResponse> {
    try {
      await this.ensureReady();
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
      const decodedToken = await admin.auth().verifyIdToken(googleToken);
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

    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de l\'inscription Google:', error);
      if ((error as { code?: string })?.code === 'auth/id-token-expired') {
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
  public async verifyEmail(
    request: VerifyEmailRequest,
  ): Promise<RegistrationResponse> {
    try {
      await this.ensureReady();
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

      const now = admin.firestore.Timestamp.now();
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
        emailVerificationCode: undefined, // sera supprimé par sanitize
        emailCodeExpiry: undefined,       // sera supprimé par sanitize
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

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la vérification email:', error);
      return {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      };
    }
  }

  // Ajout du numéro de téléphone
  public async addPhone(
    request: AddPhoneRequest,
  ): Promise<RegistrationResponse> {
    try {
      await this.ensureReady();
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
        await admin.auth().getUserByPhoneNumber(normalizedPhone);
        return {
          success: false,
          error: { 
            code: 'PHONE_EXISTS', 
            message: 'Ce numéro est déjà utilisé.',
          },
        };
      } catch (error: unknown) {
        // Vérification du code d'erreur
        const err = error as { code?: string };
        if (err.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      const verificationCode = this.generateVerificationCode();
      const expiry = admin.firestore.Timestamp.fromMillis(
        Date.now() + PHONE_CODE_EXPIRY_MINUTES * 60 * 1000,
      );

      await this.updateUser(sessionId, {
        phone: normalizedPhone,
        country,
        preferredCurrency,
        phoneVerificationCode: verificationCode,
        phoneCodeExpiry: expiry,
        step: 'phone_verification',
        lastCodeSentAt: admin.firestore.Timestamp.now(),
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

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de l\'ajout du téléphone:', error);
      return {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      };
    }
  }

  // Vérification finale et création du compte
  public async verifyPhone(
    request: VerifyPhoneRequest,
  ): Promise<RegistrationResponse> {
    await this.ensureReady();
    const batch = this.db.batch();
    let createdFirebaseUser = false;
    let firebaseUid: string | undefined;

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

      const now = admin.firestore.Timestamp.now();
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
          await admin.auth().updateUser(firebaseUid, {
            phoneNumber: session.phone,
          });
        } else {
          // Cas email - créer l'utilisateur Firebase Auth
          const userRecord = await admin.auth().createUser({
            email: session.email,
            phoneNumber: session.phone,
            emailVerified: true,
          });
          firebaseUid = userRecord.uid;
          createdFirebaseUser = true;
        }

        // 2. Créer le document utilisateur dans Firestore
        // Utiliser le numéro de téléphone comme identifiant du document 
        // utilisateur
        const userDocId = session.phone!;
        const userDoc = this.db.collection('users').doc(userDocId);
        batch.set(userDoc, {
          id: userDocId,
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
          // Persist the Firebase UID so downstream services (core) can 
          // link wallet
          firebaseUid,
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

      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error('Erreur lors de la création du compte:', error);
        
        // Rollback en cas d'échec
        if (createdFirebaseUser && firebaseUid) {
          try {
            await admin.auth().deleteUser(firebaseUid);
            // eslint-disable-next-line no-console
            console.log(
              `Rollback: Utilisateur Firebase ${firebaseUid} supprimé`,
            );
          } catch (rollbackError) {
            // eslint-disable-next-line no-console
            console.error(
              'Erreur lors du rollback Firebase Auth:', 
              rollbackError,
            );
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

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la vérification du téléphone:', error);
      return {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      };
    }
  }

  // Récupérer le statut d'une inscription
  public async getRegistrationStatus(
    sessionId: string,
  ): Promise<RegistrationResponse> {
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

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors de la récupération du statut:', error);
      return {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      };
    }
  }

  // Nettoyage des sessions expirées (à exécuter périodiquement)
  public async cleanExpiredSessions(): Promise<void> {
    try {
      const expiredTime = admin.firestore.Timestamp.fromMillis(
        Date.now() - SESSION_EXPIRY_MINUTES * 60 * 1000,
      );

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

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur lors du nettoyage des sessions:', error);
    }
  }
}

export default new RegistrationService();