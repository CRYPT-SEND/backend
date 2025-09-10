import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { Admin } from '../models/admin.model';

// Types pour éviter les "any"
interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

interface AdminData {
  role?: string;
  uid?: string;
  [key: string]: unknown;
}

// Interface pour étendre Request avec les propriétés admin
export interface SuperAdminRequest extends Request {
  admin?: DecodedIdToken;
  adminData?: AdminData;
}

// Type pour les erreurs Firebase
interface FirebaseError extends Error {
  code?: string;
}

// Interface pour les données du body de createAdmin
interface CreateAdminBody {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  tel: string;
  role?: 'ADMIN' | 'SUPER_ADMIN';
}

// Interface pour les données du body de updateAdmin
interface UpdateAdminBody {
  nom?: string;
  prenom?: string;
  tel?: string;
  isActive?: boolean;
  role?: 'ADMIN' | 'SUPER_ADMIN';
}

// Interface pour les données du body de resetAdminPassword
interface ResetPasswordBody {
  newPassword: string;
}

/**
 * Middleware qui vérifie que l'utilisateur est un super admin
 */
export async function superAdminAuthMiddleware(
  req: SuperAdminRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Vérifier si l'utilisateur est un super admin
    const userSnapshot = await admin.firestore()
      .collection('admins')
      .doc(decodedToken.uid)
      .get();
    const userData = userSnapshot.data() as AdminData | undefined;
    
    if (!userData || userData.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ 
        error: 'Accès réservé aux super administrateurs', 
      });
    }
    
    // Stocker les données admin dans la requête
    req.admin = decodedToken;
    req.adminData = userData;
    next();
  } catch {
    // Bloc catch sans capturer l'erreur
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

/**
 * Crée un nouvel administrateur
 */
export async function createAdmin(req: SuperAdminRequest, res: Response) {
  try {
    const body = req.body as CreateAdminBody;
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
      await admin.auth().getUserByEmail(email);
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    } catch (err) {
      // L'utilisateur n'existe pas, on continue
      const fbError = err as FirebaseError;
      if (fbError.code !== 'auth/user-not-found') {
        throw err;
      }
    }
    
    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${prenom} ${nom}`,
      phoneNumber: tel,
    });
    
    // Ajouter les custom claims pour le rôle
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    
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
    
    await admin.firestore()
      .collection('admins')
      .doc(userRecord.uid)
      .set(adminData);
    
    return res.status(201).json({
      message: 'Administrateur créé avec succès',
      adminId: userRecord.uid,
    });
  } catch (err) {
    // console.error('Erreur création admin:', err);
    const fbError = err as Error;
    return res.status(500).json({ 
      error: 'Erreur lors de la création de l\'administrateur',
      details: fbError.message, 
    });
  }
}

/**
 * Liste tous les administrateurs
 */
export async function getAllAdmins(req: Request, res: Response) {
  try {
    const adminsSnapshot = await admin.firestore().collection('admins').get();
    const admins: Admin[] = [];
    
    adminsSnapshot.forEach(doc => {
      const data = doc.data();
      admins.push({ id: doc.id, ...data } as Admin);
    });
    
    return res.status(200).json(admins);
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des administrateurs', 
    });
  }
}

/**
 * Récupère les informations d'un administrateur
 */
export async function getAdminById(req: Request, res: Response) {
  try {
    const { adminId } = req.params;
    
    const adminDoc = await admin.firestore()
      .collection('admins')
      .doc(adminId)
      .get();
    
    if (!adminDoc.exists) {
      return res.status(404).json({ error: 'Administrateur non trouvé' });
    }
    
    const data = adminDoc.data();
    return res.status(200).json({ id: adminDoc.id, ...data });
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'administrateur', 
    });
  }
}

/**
 * Met à jour les informations d'un administrateur
 */
export async function updateAdmin(req: SuperAdminRequest, res: Response) {
  try {
    const { adminId } = req.params;
    const body = req.body as UpdateAdminBody;
    const { nom, prenom, tel, isActive, role } = body;
    
    // Vérifier si l'admin existe
    const adminDoc = await admin.firestore()
      .collection('admins')
      .doc(adminId)
      .get();
      
    if (!adminDoc.exists) {
      return res.status(404).json({ error: 'Administrateur non trouvé' });
    }
    
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    
    // Mise à jour conditionnelle des champs
    if (nom !== undefined) updateData.nom = nom;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (tel !== undefined) updateData.tel = tel;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Mise à jour du rôle avec vérification
    if (role !== undefined) {
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return res.status(400).json({ error: 'Rôle invalide' });
      }
      updateData.role = role;
      
      // Mettre à jour les custom claims
      await admin.auth().setCustomUserClaims(adminId, { role });
    }
    
    // Mise à jour dans Firestore
    await admin.firestore()
      .collection('admins')
      .doc(adminId)
      .update(updateData);
    
    // Mise à jour dans Auth si nécessaire (désactivation du compte)
    if (isActive !== undefined) {
      await admin.auth().updateUser(adminId, { disabled: !isActive });
    }
    
    return res.status(200).json({ 
      message: 'Administrateur mis à jour avec succès', 
    });
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la mise à jour de l\'administrateur', 
    });
  }
}

/**
 * Supprime un administrateur
 */
export async function deleteAdmin(req: SuperAdminRequest, res: Response) {
  try {
    const { adminId } = req.params;
    
    // Vérifier que l'admin n'essaie pas de se supprimer lui-même
    if (req.admin && adminId === req.admin.uid) {
      return res.status(400).json({ 
        error: 'Vous ne pouvez pas supprimer votre propre compte', 
      });
    }
    
    // Vérifier si l'admin existe
    const adminDoc = await admin.firestore()
      .collection('admins')
      .doc(adminId)
      .get();
      
    if (!adminDoc.exists) {
      return res.status(404).json({ error: 'Administrateur non trouvé' });
    }
    
    // Supprimer de Firestore
    await admin.firestore().collection('admins').doc(adminId).delete();
    
    // Supprimer de Firebase Auth
    await admin.auth().deleteUser(adminId);
    
    return res.status(200).json({ 
      message: 'Administrateur supprimé avec succès', 
    });
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la suppression de l\'administrateur', 
    });
  }
}

/**
 * Réinitialise le mot de passe d'un administrateur
 */
export async function resetAdminPassword(
  req: SuperAdminRequest, 
  res: Response,
) {
  try {
    const { adminId } = req.params;
    const body = req.body as ResetPasswordBody;
    const { newPassword } = body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Le nouveau mot de passe doit contenir au moins 6 caractères', 
      });
    }
    
    // Vérifier si l'admin existe
    const adminDoc = await admin.firestore()
      .collection('admins')
      .doc(adminId)
      .get();
      
    if (!adminDoc.exists) {
      return res.status(404).json({ error: 'Administrateur non trouvé' });
    }
    
    // Mettre à jour le mot de passe
    await admin.auth().updateUser(adminId, { password: newPassword });
    
    return res.status(200).json({ 
      message: 'Mot de passe réinitialisé avec succès', 
    });
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la réinitialisation du mot de passe', 
    });
  }
}