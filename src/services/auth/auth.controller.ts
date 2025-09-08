
import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import * as admin from 'firebase-admin';

// Auth endpoints


export async function register(req: Request, res: Response) {
  try {
    const { email, password, phone, country, preferredCurrency } = req.body as {
      email: string,
      password: string,
      phone: string,
      country: string,
      preferredCurrency?: string,
    };
    const result = await AuthService.register({ email, password, phone, country, preferredCurrency });
    return res.status(result.status).json(result.data);
  } catch (error) {
    const errMsg = (error instanceof Error && error.message) ?? 'Erreur serveur.';
    return res.status(500).json({ error: errMsg });
  }
}



export async function logout(req: Request, res: Response) {
  try {
    const result = await AuthService.logout(req.body);
    return res.status(result.status).json(result.data);
  } catch (error) {
    const errMsg = (error instanceof Error && error.message) ?? 'Erreur serveur.';
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
export async function authenticateFirebaseToken(req: Request, res: Response, next: (err?: unknown) => void) {
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
    (req as unknown as { user: admin.auth.DecodedIdToken }).user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token non valide.' });
  }
}

// Exemple de route protégée
export async function getProfile(req: Request, res: Response) {
  await Promise.resolve(); // Pour satisfaire require-await
  const user = (req as { user?: admin.auth.DecodedIdToken }).user;
  return res.status(200).json({ message: 'Accès autorisé', user });
}

/**
 * Les méthodes login, register, refreshToken, logout sont gérées côté backend pour orchestrer l'appel au service.
 * Le backend valide le token, gère l'autorisation et peut enrichir le profil utilisateur.
 */

/**
 * Côté frontend :
 * - L'utilisateur se connecte avec le SDK Firebase (email/mot de passe, Google, etc.).
 * - Le frontend reçoit un idToken (JWT) après connexion.
 * - À chaque requête API, le frontend envoie ce idToken dans l'en-tête Authorization.
 */

/**
 * Côté backend :
 * - On reçoit le idToken dans l'en-tête Authorization.
 * - On vérifie le token avec Firebase Admin SDK.
 * - On gère l'autorisation et les règles métier.
 */

// 
/**
 * Exemple d'autorisation sur une route protégée
 */


/**
 * Les méthodes login, register, refreshToken, logout ne sont plus nécessaires côté backend.
 * Elles sont gérées par le frontend avec le SDK Firebase.
 *
 * Le backend doit uniquement :
 * - Vérifier le token envoyé par le frontend.
 * - Gérer l'autorisation et les accès aux ressources.
 * - Optionnel : gérer des profils ou des données supplémentaires en base.
 */

