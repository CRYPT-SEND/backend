"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = adminAuthMiddleware;
exports.createUser = createUser;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.blockUser = blockUser;
exports.getAllTransactions = getAllTransactions;
exports.approveTransaction = approveTransaction;
exports.getPendingKycRequests = getPendingKycRequests;
exports.approveKyc = approveKyc;
exports.getDashboardStats = getDashboardStats;
// ===== FONCTIONS UTILITAIRES =====
function generateRandomPassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}
async function sendEmail(to, subject, body) {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail', // ou 'smtp' selon ton fournisseur
        auth: {
            user: 'ton.email@gmail.com',
            pass: 'ton_mot_de_passe_app', // Utilise un mot de passe d'application Gmail
        },
    });
    await transporter.sendMail({
        from: 'CryptSend <ton.email@gmail.com>',
        to,
        subject,
        text: body,
    });
}
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Middleware d'authentification admin
async function adminAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token manquant' });
    }
    const idToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(idToken);
        // Vérifier si l'utilisateur est un admin
        const userSnapshot = await firebase_admin_1.default.firestore()
            .collection('users')
            .doc(decodedToken.uid)
            .get();
        const userData = userSnapshot.data();
        if (!userData || userData.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }
        req.admin = decodedToken;
        req.adminData = userData;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Token invalide' });
    }
}
// ===== CONTROLEURS UTILISATEURS =====
// ===== AJOUT UTILISATEUR =====
async function createUser(req, res) {
    try {
        const { email, name, role = 'USER', ...otherData } = req.body;
        if (!email || !name) {
            return res.status(400).json({ error: 'Email et nom requis' });
        }
        // Générer un mot de passe aléatoire
        const generatedPassword = generateRandomPassword();
        // 1. Créer l'utilisateur dans Firebase Auth
        const userRecord = await firebase_admin_1.default.auth().createUser({
            email: email,
            password: generatedPassword,
            emailVerified: false,
            disabled: false,
        });
        // 2. Ajouter le document dans Firestore
        await firebase_admin_1.default.firestore().collection('users').doc(userRecord.uid).set({
            email,
            name,
            role,
            ...otherData,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // 3. Envoyer le mot de passe par email
        await sendEmail(email, 'Votre compte a été créé', `Bonjour ${name},\n\nVotre compte a été créé.\nVotre mot de passe est : ${generatedPassword}\n\nMerci de le changer après connexion.`);
        return res.status(201).json({ message: 'Utilisateur créé avec succès', uid: userRecord.uid });
    }
    catch (error) {
        return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur', details: error });
    }
}
async function getAllUsers(req, res) {
    try {
        const usersSnapshot = await firebase_admin_1.default.firestore()
            .collection('users')
            .limit(100)
            .get();
        const users = [];
        usersSnapshot.forEach(doc => users.push(doc.data()));
        return res.status(200).json(users);
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la récupération des utilisateurs',
        });
    }
}
async function getUserById(req, res) {
    try {
        const { userId } = req.params;
        const userDoc = await firebase_admin_1.default.firestore()
            .collection('users')
            .doc(userId)
            .get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        return res.status(200).json(userDoc.data());
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la récupération de l\'utilisateur',
        });
    }
}
async function updateUser(req, res) {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        // Protéger les champs sensibles
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.email; // Pour changer l'email, utiliser Firebase Auth
        // Si le champ password est présent, générer un nouveau mot de passe
        let generatedPassword;
        if (updateData.password) {
            // Générer un mot de passe aléatoire
            generatedPassword = generateRandomPassword();
            // Mettre à jour le mot de passe dans Firebase Auth
            await firebase_admin_1.default.auth().updateUser(userId, { password: generatedPassword });
            // Récupérer l'email de l'utilisateur
            const userDoc = await firebase_admin_1.default.firestore().collection('users').doc(userId).get();
            const userEmail = userDoc.data()?.email;
            if (userEmail) {
                // Envoyer le mot de passe par email
                await sendEmail(userEmail, 'Votre nouveau mot de passe', `Bonjour,\n\nVotre nouveau mot de passe est : ${generatedPassword}\n\nMerci de le changer après connexion.`);
            }
            // On ne stocke pas le mot de passe dans Firestore
            delete updateData.password;
        }
        await firebase_admin_1.default.firestore().collection('users').doc(userId).update({
            ...updateData,
            updatedAt: new Date(),
        });
        return res.status(200).json({
            message: 'Utilisateur mis à jour avec succès',
            passwordSent: !!generatedPassword,
        });
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la mise à jour de l\'utilisateur',
        });
    }
}
async function blockUser(req, res) {
    try {
        const { userId } = req.params;
        // Mettre à jour le statut dans Firestore
        await firebase_admin_1.default.firestore().collection('users').doc(userId).update({
            statusId: 'BLOCKED',
            updatedAt: new Date(),
        });
        // Désactiver le compte dans Firebase Auth
        await firebase_admin_1.default.auth().updateUser(userId, { disabled: true });
        return res.status(200).json({
            message: 'Utilisateur bloqué avec succès',
        });
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors du blocage de l\'utilisateur',
        });
    }
}
// ===== CONTROLEURS TRANSACTIONS =====
async function getAllTransactions(req, res) {
    try {
        const queryParams = req.query;
        const status = queryParams.status;
        const userId = queryParams.userId;
        const limit = queryParams.limit ? parseInt(queryParams.limit) : 50;
        const startAfter = queryParams.startAfter;
        let query = firebase_admin_1.default.firestore()
            .collection('transfer_orders');
        if (status) {
            query = query.where('status', '==', status);
        }
        if (userId) {
            query = query.where('userId', '==', userId);
        }
        query = query.orderBy('createdAt', 'desc').limit(limit);
        if (startAfter) {
            const startAfterDoc = await firebase_admin_1.default.firestore()
                .collection('transfer_orders')
                .doc(startAfter)
                .get();
            if (startAfterDoc.exists) {
                query = query.startAfter(startAfterDoc);
            }
        }
        const snapshot = await query.get();
        const transactions = [];
        snapshot.forEach(doc => transactions.push({ id: doc.id, ...doc.data() }));
        return res.status(200).json(transactions);
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la récupération des transactions',
        });
    }
}
async function approveTransaction(req, res) {
    try {
        const { transactionId } = req.params;
        const transactionRef = firebase_admin_1.default.firestore()
            .collection('transfer_orders')
            .doc(transactionId);
        const transaction = await transactionRef.get();
        if (!transaction.exists) {
            return res.status(404).json({ error: 'Transaction non trouvée' });
        }
        const transactionData = transaction.data();
        if (!transactionData || transactionData.status !== 'PENDING_APPROVAL') {
            return res.status(400).json({
                error: 'La transaction ne peut pas être approuvée dans son ' +
                    'état actuel',
            });
        }
        const adminUid = req.admin?.uid ?? 'unknown';
        const body = req.body;
        await transactionRef.update({
            status: 'PROCESSING',
            timeline: firebase_admin_1.default.firestore.FieldValue.arrayUnion({
                status: 'APPROVED',
                timestamp: new Date(),
                adminId: adminUid,
                note: body.note ?? 'Approuvé par admin',
            }),
            updatedAt: new Date(),
        });
        return res.status(200).json({
            message: 'Transaction approuvée avec succès',
        });
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de l\'approbation de la transaction',
        });
    }
}
// ===== CONTROLEURS KYC =====
async function getPendingKycRequests(req, res) {
    try {
        const snapshot = await firebase_admin_1.default.firestore()
            .collection('kyc_profiles')
            .where('statusId', '==', 'PENDING')
            .orderBy('createdAt', 'asc')
            .limit(50)
            .get();
        const kycRequests = [];
        snapshot.forEach(doc => kycRequests.push({ id: doc.id, ...doc.data() }));
        return res.status(200).json(kycRequests);
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la récupération des demandes KYC',
        });
    }
}
async function approveKyc(req, res) {
    try {
        const { userId } = req.params;
        const body = req.body;
        const { levelId, notes } = body;
        const kycRef = firebase_admin_1.default.firestore().collection('kyc_profiles').doc(userId);
        const kycDoc = await kycRef.get();
        if (!kycDoc.exists) {
            return res.status(404).json({ error: 'Profil KYC non trouvé' });
        }
        const kycData = kycDoc.data();
        // Mettre à jour le profil KYC
        await kycRef.update({
            statusId: 'APPROVED',
            levelId: levelId ?? (kycData?.levelId ?? 'L1'),
            notes: notes ?? '',
            updatedAt: new Date(),
        });
        // Mettre à jour le niveau KYC de l'utilisateur
        await firebase_admin_1.default.firestore().collection('users').doc(userId).update({
            kycLevelId: levelId ?? (kycData?.levelId ?? 'L1'),
            updatedAt: new Date(),
        });
        return res.status(200).json({ message: 'KYC approuvé avec succès' });
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de l\'approbation du KYC',
        });
    }
}
// ===== CONTROLEURS DASHBOARD =====
async function getDashboardStats(req, res) {
    try {
        // Nombre total d'utilisateurs
        const userCountData = await firebase_admin_1.default.firestore()
            .collection('users')
            .count()
            .get();
        const userCount = userCountData.data().count;
        // Nombre de transactions par statut
        const statusCounts = {};
        const statusSnapshot = await firebase_admin_1.default.firestore()
            .collection('transfer_orders')
            .get();
        statusSnapshot.forEach(doc => {
            const docData = doc.data();
            const status = docData.status;
            statusCounts[status] = (statusCounts[status] ?? 0) + 1;
        });
        // Nombre de demandes KYC en attente
        const pendingKycCountData = await firebase_admin_1.default.firestore()
            .collection('kyc_profiles')
            .where('statusId', '==', 'PENDING')
            .count()
            .get();
        const pendingKycCount = pendingKycCountData.data().count;
        return res.status(200).json({
            userCount,
            transactionStatusCounts: statusCounts,
            pendingKycCount,
        });
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la récupération des statistiques',
        });
    }
}
