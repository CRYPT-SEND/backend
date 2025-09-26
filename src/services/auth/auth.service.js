"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.verifyIdToken = verifyIdToken;
exports.logout = logout;
// import fetch from 'node-fetch';
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebase_1 = require("../../../config/firebase");
// Register utilisateur avec le SDK Admin
async function register({ email, password, phone, country, preferredCurrency, }) {
    await firebase_1.firebaseInitPromise;
    if (!email || !password || !phone || !country) {
        return { status: 400, data: { error: 'Champs obligatoires manquants.' } };
    }
    try {
        // 1. Créer l'utilisateur dans Firebase Auth
        const userRecord = await firebase_admin_1.default.auth().createUser({
            email,
            password,
            phoneNumber: phone,
        });
        // 2. Créer le document utilisateur dans Firestore
        const now = new Date();
        await firebase_admin_1.default.firestore().collection('users').doc(userRecord.uid).set({
            id: userRecord.uid,
            email,
            phone,
            country,
            preferredCurrencyId: preferredCurrency ?? 'EUR',
            kycLevelId: 'L1', // Niveau par défaut
            statusId: 'ACTIVE', // Statut par défaut
            twoFAEnabled: false,
            deviceIds: [],
            lastLoginAt: now,
            riskScore: 0,
            createdAt: now,
            updatedAt: now,
        });
        // Logger l'action dans un environnement de production serait mieux
        // console.log(`Utilisateur ${userRecord.uid} créé dans Auth et Firestore`);
        return {
            status: 201,
            data: {
                message: 'Utilisateur créé avec succès.',
                userId: userRecord.uid,
            },
        };
    }
    catch (error) {
        // console.error('Erreur création utilisateur:', error);
        let errMsg = 'Erreur lors de la création.';
        // Cast vers le type FirebaseError pour accéder aux propriétés en sécurité
        const fbError = error;
        if (fbError.code === 'auth/email-already-exists') {
            errMsg = 'Cet email existe déjà.';
            return { status: 409, data: { error: errMsg } };
        }
        return {
            status: 400,
            data: {
                error: fbError.message ?? errMsg,
            },
        };
    }
}
// Vérification du token côté backend (à utiliser après login côté frontend)
async function verifyIdToken(idToken) {
    try {
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(idToken);
        return {
            status: 200,
            data: {
                message: 'Token valide.',
                uid: decodedToken.uid,
                email: decodedToken.email,
            },
        };
    }
    catch (_error) {
        // On n'utilise pas l'erreur donc on préfixe avec _
        return {
            status: 401,
            data: { error: 'Token invalide.' },
        };
    }
}
// Logout (coté Firebase, il n'y a pas d'API pour invalider un token)
async function logout(_params) {
    await Promise.resolve();
    return {
        status: 200,
        data: { message: 'Déconnexion réussie.' },
    };
}
