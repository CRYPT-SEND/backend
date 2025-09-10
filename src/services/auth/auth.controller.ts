// controllers/auth.controller.ts (Version mise à jour)

import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import RegistrationService from './registration.service';
import * as admin from 'firebase-admin';
import {
  EmailRegistrationRequest,
  GoogleRegistrationRequest,
  VerifyEmailRequest,
  AddPhoneRequest,
  VerifyPhoneRequest,
} from '../../models/user.model';

// Rate limiting map (en production, utiliser Redis)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

// Middleware de rate limiting simple
function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: () => void) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = rateLimitMap.get(key);
    if (!record || record.resetTime < windowStart) {
      record = { count: 1, resetTime: now + windowMs };
    } else {
      record.count++;
    }

    rateLimitMap.set(key, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMIT', message: 'Trop de requêtes.' },
      });
    }

    next();
  };
}

// Middleware de validation des inputs
function validateInput(requiredFields: string[]) {
  return (req: Request, res: Response, next: () => void) => {
    const missingFields = requiredFields.filter(field => 
      !(req.body as Record<string, unknown>)[field],
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'MISSING_FIELDS', 
          message: `Champs manquants: ${missingFields.join(', ')}`, 
        },
      });
    }
    next();
  };
}

// ==================== ENDPOINTS D'INSCRIPTION MULTI-ÉTAPES ====================

// ÉTAPE 1A: Inscription par email
export const registerEmail = [
  rateLimit(5, 60000), // 5 requêtes par minute
  validateInput(['email']),
  async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const request: EmailRegistrationRequest = {
        email: (body.email as string).trim().toLowerCase(),
      };

      const result = await RegistrationService.registerWithEmail(request);
      const statusCode = result.success ? 200 : 400;
      
      return res.status(statusCode).json(result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur dans registerEmail:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      });
    }
  },
];

// ÉTAPE 1B: Inscription via Google
export const registerGoogle = [
  rateLimit(5, 60000),
  validateInput(['googleToken']),
  async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const request: GoogleRegistrationRequest = {
        googleToken: body.googleToken as string,
      };

      const result = await RegistrationService.registerWithGoogle(request);
      const statusCode = result.success ? 200 : 400;
      
      return res.status(statusCode).json(result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur dans registerGoogle:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      });
    }
  },
];

// ÉTAPE 2: Vérification du code email
export const verifyEmail = [
  rateLimit(10, 60000), // 10 tentatives par minute
  validateInput(['sessionId', 'code']),
  async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const request: VerifyEmailRequest = {
        sessionId: body.sessionId as string,
        code: (body.code as string).replace(/\s/g, ''),
      };

      const result = await RegistrationService.verifyEmail(request);
      const statusCode = result.success ? 200 : 400;
      
      return res.status(statusCode).json(result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur dans verifyEmail:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      });
    }
  },
];

// ÉTAPE 3: Ajout du numéro de téléphone
export const addPhone = [
  rateLimit(5, 60000),
  validateInput(['sessionId', 'phone', 'country']),
  async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const request: AddPhoneRequest = {
        sessionId: body.sessionId as string,
        phone: (body.phone as string).trim(),
        country: (body.country as string).trim().toUpperCase(),
        preferredCurrency: body.preferredCurrency ? 
          (body.preferredCurrency as string).trim().toUpperCase() : 
          undefined,
      };

      const result = await RegistrationService.addPhone(request);
      const statusCode = result.success ? 200 : 400;
      
      return res.status(statusCode).json(result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur dans addPhone:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      });
    }
  },
];

// ÉTAPE 4: Vérification finale du téléphone
export const verifyPhone = [
  rateLimit(10, 60000),
  validateInput(['sessionId', 'code']),
  async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, unknown>;
      const request: VerifyPhoneRequest = {
        sessionId: body.sessionId as string,
        code: (body.code as string).replace(/\s/g, ''),
      };

      const result = await RegistrationService.verifyPhone(request);
      const statusCode = result.success ? 200 : 400;
      
      return res.status(statusCode).json(result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erreur dans verifyPhone:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
      });
    }
  },
];

// Récupération du statut d'inscription
export async function getRegistrationStatus(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'MISSING_SESSION_ID', 
          message: 'ID de session manquant.', 
        },
      });
    }

    const result = await RegistrationService.getRegistrationStatus(sessionId);
    const statusCode = result.success ? 200 : 400;
    
    return res.status(statusCode).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur dans getRegistrationStatus:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Erreur serveur.' },
    });
  }
}

// ==================== ANCIENS ENDPOINTS (CONSERVÉS) ====================

// Ancien endpoint d'inscription (déprécié mais conservé)
export async function register(req: Request, res: Response) {
  try {
    const { 
      email, 
      password, 
      phone, 
      country, 
      preferredCurrency, 
    } = req.body as {
      email: string,
      password: string,
      phone: string,
      country: string,
      preferredCurrency?: string,
    };
    
    const result = await AuthService.register({ 
      email, 
      password, 
      phone, 
      country, 
      preferredCurrency, 
    });
    
    return res.status(result.status).json(result.data);
  } catch (error) {
    const errMsg = (error instanceof Error && error.message) 
      ?? 'Erreur serveur.';
    return res.status(500).json({ error: errMsg });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const result = await AuthService.logout(req.body);
    return res.status(result.status).json(result.data);
  } catch (error) {
    const errMsg = (error instanceof Error && error.message) 
      ?? 'Erreur serveur.';
    return res.status(500).json({ error: errMsg });
  }
}

// Méthodes non implémentées (2FA, KYC)
export function twofaVerify(req: Request, res: Response) {
  return res.status(501).json({ error: '2FA Verify non implémenté.' });
}

export function twofaSetup(req: Request, res: Response) {
  return res.status(501).json({ error: '2FA Setup non implémenté.' });
}

export function kycProfile(req: Request, res: Response) {
  return res.status(501).json({ error: 'KYC Profile non implémenté.' });
}

export function kycDocuments(req: Request, res: Response) {
  return res.status(501).json({ error: 'KYC Documents non implémenté.' });
}

// Middleware pour valider le token Firebase envoyé par le frontend
export async function authenticateFirebaseToken(
  req: Request, 
  res: Response, 
  next: (err?: unknown) => void,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token manquant.' });
  }
  
  const idToken = authHeader.split(' ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'Token invalide.' });
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as unknown as { user: admin.auth.DecodedIdToken }).user = 
      decodedToken;
    next();
  } catch {
    return res.status(401).json({ error: 'Token non valide.' });
  }
}

// Exemple de route protégée
export async function getProfile(req: Request, res: Response) {
  await Promise.resolve(); // Pour satisfaire require-await
  const user = (req as { user?: admin.auth.DecodedIdToken }).user;
  return res.status(200).json({ 
    message: 'Accès autorisé', 
    user, 
  });
}