"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserWithWallet = registerUserWithWallet;
exports.transferCusd = transferCusd;
const registration_service_1 = __importDefault(require("../auth/registration.service"));
// import { createCeloWallet, sendCusd } from '../blockchain/blockchain.service';
const crypto_1 = require("../../utils/crypto");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
/**
 * Inscription complète d'un utilisateur + création et liaison du wallet
 * On suppose que request contient les infos nécessaires pour verifyPhone
 */
async function registerUserWithWallet(request) {
    // 1. Vérifier le téléphone et créer l'utilisateur via registrationService
    const registrationResult = await registration_service_1.default.verifyPhone(request);
    if (!registrationResult.success || !registrationResult.data) {
        throw new Error(registrationResult.error?.message ?? 'Registration failed');
    }
    // 2. Récupérer l'UID Firebase et le numéro de téléphone normalisé
    // On va lier nos documents Firestore par le numéro de téléphone
    // (ID des docs)
    const session = await registration_service_1.default.getUser(request.sessionId);
    const firebaseUid = session?.firebaseUid;
    const phone = session?.phone;
    if (!firebaseUid) {
        throw new Error('Utilisateur Firebase non trouvé après inscription');
    }
    if (!phone) {
        throw new Error('Numéro de téléphone introuvable dans la session');
    }
    // 3. Créer le wallet Celo
    // const celoWallet = createCeloWallet();
    // Utiliser le numéro de téléphone comme identifiant logique également
    // pour le chiffrement
    // const encryptedPrivateKey = encryptPrivateKey(
    //   celoWallet.privateKey, 
    //   phone,
    // );
    // 4. Préparer et sauvegarder le wallet
    // L'ID du document wallet est le numéro de téléphone de l'utilisateur
    // const walletDoc = admin.firestore().collection('wallets').doc(phone);
    // const wallet: Wallet = {
    //   id: walletDoc.id, // = phone
    //   userId: phone,    // lier via le numéro de téléphone
    //   typeId: 'CELO',
    //   networkId: 'ALFAJORES',
    //   address: celoWallet.address,
    //   encryptedPrivateKey,
    //   keyDerivationPath: '',
    //   balance: {},
    //   statusId: 'ACTIVE',
    //   createdAt: admin.firestore.Timestamp.now(),
    //   lastSyncAt: admin.firestore.Timestamp.now(),
    // };
    // await walletDoc.set(wallet);
    // 5. Retourner le résultat d'inscription et le wallet
    // return { registration: registrationResult, wallet };
}
/**
 * Transfert d'argent cUSD entre deux utilisateurs
 */
async function transferCusd({ senderUserId, recipientPhone, amount, }) {
    // 1. Récupérer le wallet de l'utilisateur émetteur
    const walletSnap = await firebase_admin_1.default.firestore()
        .collection('wallets')
        .where('userId', '==', senderUserId) // senderUserId est le téléphone
        .limit(1)
        .get();
    if (walletSnap.empty) {
        throw new Error('Wallet utilisateur non trouvé');
    }
    const wallet = walletSnap.docs[0].data();
    // 2. Déchiffrer la clé privée
    if (!wallet.encryptedPrivateKey) {
        throw new Error('Clé privée chiffrée manquante');
    }
    // Déchiffrer en utilisant le téléphone (clé de liaison)
    const privateKey = (0, crypto_1.decryptPrivateKey)(wallet.encryptedPrivateKey, senderUserId);
    // 3. Résoudre le numéro de téléphone du destinataire en adresse wallet
    // Désormais, l'ID du document utilisateur est le téléphone
    const recipientUserDoc = await firebase_admin_1.default.firestore()
        .collection('users')
        .doc(recipientPhone)
        .get();
    if (!recipientUserDoc.exists) {
        throw new Error('Destinataire introuvable');
    }
    // La variable recipientUser n'est pas utilisée, on peut l'omettre
    // Récupérer l'adresse du wallet du destinataire
    const recipientWalletSnap = await firebase_admin_1.default.firestore()
        .collection('wallets')
        .where('userId', '==', recipientPhone)
        .limit(1)
        .get();
    if (recipientWalletSnap.empty) {
        throw new Error('Wallet du destinataire introuvable');
    }
    const recipientWallet = recipientWalletSnap.docs[0].data();
    const recipientAddress = recipientWallet.address;
    if (!recipientAddress) {
        throw new Error('Adresse du destinataire introuvable');
    }
    // 4. Effectuer le transfert via le service blockchain
    // const result = await sendCusd(privateKey, recipientAddress, amount);
    // 5. (Optionnel) Mettre à jour le solde du wallet en base
    // return { txHash: result.txHash };
}
