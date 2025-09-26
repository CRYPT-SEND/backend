"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminAuthMiddleware = superAdminAuthMiddleware;
exports.createAdmin = createAdmin;
exports.getAllAdmins = getAllAdmins;
exports.getAdminById = getAdminById;
exports.updateAdmin = updateAdmin;
exports.deleteAdmin = deleteAdmin;
exports.resetAdminPassword = resetAdminPassword;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
/**
 * Middleware qui vérifie que l'utilisateur est un super admin
 */
async function superAdminAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token manquant' });
    }
    const idToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await firebase_admin_1.default.auth().verifyIdToken(idToken);
        // Vérifier si l'utilisateur est un super admin
        const userSnapshot = await firebase_admin_1.default.firestore()
            .collection('admins')
            .doc(decodedToken.uid)
            .get();
        const userData = userSnapshot.data();
        if (!userData || userData.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                error: 'Accès réservé aux super administrateurs',
            });
        }
        // Stocker les données admin dans la requête
        req.admin = decodedToken;
        req.adminData = userData;
        next();
    }
    catch {
        // Bloc catch sans capturer l'erreur
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
}
/**
 * Crée un nouvel administrateur
 */
async function createAdmin(req, res) {
    try {
        const body = req.body;
        const { email, password, nom, prenom, tel, role = 'ADMIN' } = body;
        // Validation des champs obligatoires
        if (!email || !password || !nom || !prenom || !tel) {
            return res.status(400).json({
                error: 'Veuillez fournir tous les champs obligatoires',
            });
        }
        // Valider le rôle
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            return res.status(400).json({ error: 'Rôle invalide' });
        }
        // Vérifier si l'email existe déjà
        try {
            await firebase_admin_1.default.auth().getUserByEmail(email);
            return res.status(409).json({ error: 'Cet email est déjà utilisé' });
        }
        catch (err) {
            // L'utilisateur n'existe pas, on continue
            const fbError = err;
            if (fbError.code !== 'auth/user-not-found') {
                throw err;
            }
        }
        // Créer l'utilisateur dans Firebase Auth
        const userRecord = await firebase_admin_1.default.auth().createUser({
            email,
            password,
            displayName: `${prenom} ${nom}`,
            phoneNumber: tel,
        });
        // Ajouter les custom claims pour le rôle
        await firebase_admin_1.default.auth().setCustomUserClaims(userRecord.uid, { role });
        // Créer le document admin dans Firestore
        const now = new Date();
        // S'assurer que req.admin existe
        const createdBy = req.admin?.uid ?? 'unknown';
        const adminData = {
            id: userRecord.uid,
            email,
            nom,
            prenom,
            tel,
            role,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            createdBy,
        };
        await firebase_admin_1.default.firestore()
            .collection('admins')
            .doc(userRecord.uid)
            .set(adminData);
        return res.status(201).json({
            message: 'Administrateur créé avec succès',
            adminId: userRecord.uid,
        });
    }
    catch (err) {
        // console.error('Erreur création admin:', err);
        const fbError = err;
        return res.status(500).json({
            error: 'Erreur lors de la création de l\'administrateur',
            details: fbError.message,
        });
    }
}
/**
 * Liste tous les administrateurs
 */
async function getAllAdmins(req, res) {
    try {
        const adminsSnapshot = await firebase_admin_1.default.firestore().collection('admins').get();
        const admins = [];
        adminsSnapshot.forEach(doc => {
            const data = doc.data();
            admins.push({ id: doc.id, ...data });
        });
        return res.status(200).json(admins);
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la récupération des administrateurs',
        });
    }
}
/**
 * Récupère les informations d'un administrateur
 */
async function getAdminById(req, res) {
    try {
        const { adminId } = req.params;
        const adminDoc = await firebase_admin_1.default.firestore()
            .collection('admins')
            .doc(adminId)
            .get();
        if (!adminDoc.exists) {
            return res.status(404).json({ error: 'Administrateur non trouvé' });
        }
        const data = adminDoc.data();
        return res.status(200).json({ id: adminDoc.id, ...data });
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la récupération de l\'administrateur',
        });
    }
}
/**
 * Met à jour les informations d'un administrateur
 */
async function updateAdmin(req, res) {
    try {
        const { adminId } = req.params;
        const body = req.body;
        const { nom, prenom, tel, isActive, role } = body;
        // Vérifier si l'admin existe
        const adminDoc = await firebase_admin_1.default.firestore()
            .collection('admins')
            .doc(adminId)
            .get();
        if (!adminDoc.exists) {
            return res.status(404).json({ error: 'Administrateur non trouvé' });
        }
        const updateData = { updatedAt: new Date() };
        // Mise à jour conditionnelle des champs
        if (nom !== undefined)
            updateData.nom = nom;
        if (prenom !== undefined)
            updateData.prenom = prenom;
        if (tel !== undefined)
            updateData.tel = tel;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        // Mise à jour du rôle avec vérification
        if (role !== undefined) {
            if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
                return res.status(400).json({ error: 'Rôle invalide' });
            }
            updateData.role = role;
            // Mettre à jour les custom claims
            await firebase_admin_1.default.auth().setCustomUserClaims(adminId, { role });
        }
        // Mise à jour dans Firestore
        await firebase_admin_1.default.firestore()
            .collection('admins')
            .doc(adminId)
            .update(updateData);
        // Mise à jour dans Auth si nécessaire (désactivation du compte)
        if (isActive !== undefined) {
            await firebase_admin_1.default.auth().updateUser(adminId, { disabled: !isActive });
        }
        return res.status(200).json({
            message: 'Administrateur mis à jour avec succès',
        });
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la mise à jour de l\'administrateur',
        });
    }
}
/**
 * Supprime un administrateur
 */
async function deleteAdmin(req, res) {
    try {
        const { adminId } = req.params;
        // Vérifier que l'admin n'essaie pas de se supprimer lui-même
        if (req.admin && adminId === req.admin.uid) {
            return res.status(400).json({
                error: 'Vous ne pouvez pas supprimer votre propre compte',
            });
        }
        // Vérifier si l'admin existe
        const adminDoc = await firebase_admin_1.default.firestore()
            .collection('admins')
            .doc(adminId)
            .get();
        if (!adminDoc.exists) {
            return res.status(404).json({ error: 'Administrateur non trouvé' });
        }
        // Supprimer de Firestore
        await firebase_admin_1.default.firestore().collection('admins').doc(adminId).delete();
        // Supprimer de Firebase Auth
        await firebase_admin_1.default.auth().deleteUser(adminId);
        return res.status(200).json({
            message: 'Administrateur supprimé avec succès',
        });
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la suppression de l\'administrateur',
        });
    }
}
/**
 * Réinitialise le mot de passe d'un administrateur
 */
async function resetAdminPassword(req, res) {
    try {
        const { adminId } = req.params;
        const body = req.body;
        const { newPassword } = body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                error: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
            });
        }
        // Vérifier si l'admin existe
        const adminDoc = await firebase_admin_1.default.firestore()
            .collection('admins')
            .doc(adminId)
            .get();
        if (!adminDoc.exists) {
            return res.status(404).json({ error: 'Administrateur non trouvé' });
        }
        // Mettre à jour le mot de passe
        await firebase_admin_1.default.auth().updateUser(adminId, { password: newPassword });
        return res.status(200).json({
            message: 'Mot de passe réinitialisé avec succès',
        });
    }
    catch {
        return res.status(500).json({
            error: 'Erreur lors de la réinitialisation du mot de passe',
        });
    }
}
