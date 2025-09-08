// import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { firebaseInitPromise } from '../../../config/firebase';
// import { firebaseInitPromise } from '../config/firebase';



// Register utilisateur avec le SDK Admin
export async function register({
  email,
  password,
  phone,
  country,
  preferredCurrency,
}: {
  email: string,
  password: string,
  phone: string,
  country: string,
  preferredCurrency?: string
}) {
  await firebaseInitPromise;
  if (!email || !password || !phone || !country) {
    return { status: 400, data: { error: 'Champs obligatoires manquants.' } };
  }
  try {
    // 1. Créer l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      phoneNumber: phone,
    });
    
    // 2. Créer le document utilisateur dans Firestore
    const now = new Date();
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      phone,
      country,
      preferredCurrencyId: preferredCurrency || 'EUR',
      kycLevelId: 'L1', // Niveau par défaut
      statusId: 'ACTIVE', // Statut par défaut
      twoFAEnabled: false,
      deviceIds: [],
      lastLoginAt: now,
      riskScore: 0,
      createdAt: now,
      updatedAt: now,
    });
    
    console.log(`Utilisateur ${userRecord.uid} créé dans Auth et Firestore`);
    
    return {
      status: 201,
      data: {
        message: 'Utilisateur créé avec succès.',
        userId: userRecord.uid,
      },
    };
  } catch (error: any) {
    console.error('Erreur création utilisateur:', error);
    let errMsg = 'Erreur lors de la création.';
    if (error.code === 'auth/email-already-exists') {
      errMsg = 'Cet email existe déjà.';
      return { status: 409, data: { error: errMsg } };
    }
    return { status: 400, data: { error: error.message ?? errMsg } };
  }
}

// Refresh token
// 
// Vérification du token côté backend (à utiliser après login côté frontend)
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      status: 200,
      data: {
        message: 'Token valide.',
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
    };
  } catch (error) {
    return { status: 401, data: { error: 'Token invalide.' } };
  }
}

// Logout (coté Firebase, il n'y a pas d'API pour invalider un token, donc côté backend, on peut juste répondre OK)
export async function logout(_: unknown) {
  await Promise.resolve();
  return {
    status: 200,
    data: { message: 'Déconnexion réussie.' },
  };
}
