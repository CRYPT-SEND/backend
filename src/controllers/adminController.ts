// ===== FONCTIONS UTILITAIRES =====
function generateRandomPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendEmail(to: string, subject: string, body: string) {
  const transporter = nodemailer.createTransport({
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
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { Request, Response, NextFunction } from 'express';

// Types personnalisés pour étendre Request
interface DecodedIdToken {
  uid: string;
  [key: string]: unknown;
}

interface UserData {
  role?: string;
  [key: string]: unknown;
}

interface AdminRequest extends Request {
  admin?: DecodedIdToken;
  adminData?: UserData;
}

// Interface pour les paramètres de requête
interface TransactionQueryParams {
  status?: string;
  userId?: string;
  limit?: string;
  startAfter?: string;
}

// Interface pour les données de transaction
interface TransactionData {
  status: string;
  [key: string]: unknown;
}

// Interface pour les données KYC
interface KycData {
  statusId: string;
  levelId?: string;
  [key: string]: unknown;
}

// Interface pour le body des requêtes
interface ApproveKycBody {
  levelId?: string;
  notes?: string;
}

interface ApprovalBody {
  note?: string;
}

// Middleware d'authentification admin
export async function adminAuthMiddleware(
  req: AdminRequest,
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
    
    // Vérifier si l'utilisateur est un admin
    const userSnapshot = await admin.firestore()
      .collection('users')
      .doc(decodedToken.uid)
      .get();
    const userData = userSnapshot.data() as UserData | undefined;
    
    if (!userData || userData.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    req.admin = decodedToken;
    req.adminData = userData;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// ===== CONTROLEURS UTILISATEURS =====
// ===== AJOUT UTILISATEUR =====
export async function createUser(req: Request, res: Response) {
  try {
    const { email, name, role = 'USER', ...otherData } = req.body as Record<string, unknown>;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email et nom requis' });
    }

    // Générer un mot de passe aléatoire
    const generatedPassword = generateRandomPassword();

    // 1. Créer l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email as string,
      password: generatedPassword,
      emailVerified: false,
      disabled: false,
    });

    // 2. Ajouter le document dans Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      name,
      role,
      ...otherData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Envoyer le mot de passe par email
    await sendEmail(email as string, 'Votre compte a été créé',
      `Bonjour ${name},\n\nVotre compte a été créé.\nVotre mot de passe est : ${generatedPassword}\n\nMerci de le changer après connexion.`);

    return res.status(201).json({ message: 'Utilisateur créé avec succès', uid: userRecord.uid });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur', details: error });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .limit(100)
      .get();
    const users: unknown[] = [];
    usersSnapshot.forEach(doc => users.push(doc.data()));
    return res.status(200).json(users);
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des utilisateurs', 
    });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    return res.status(200).json(userDoc.data());
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération de l\'utilisateur', 
    });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const updateData = req.body as Record<string, unknown>;

    // Protéger les champs sensibles
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.email; // Pour changer l'email, utiliser Firebase Auth

    // Si le champ password est présent, générer un nouveau mot de passe
    let generatedPassword: string | undefined;
    if (updateData.password) {
      // Générer un mot de passe aléatoire
      generatedPassword = generateRandomPassword();
      // Mettre à jour le mot de passe dans Firebase Auth
      await admin.auth().updateUser(userId, { password: generatedPassword });

      // Récupérer l'email de l'utilisateur
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const userEmail = userDoc.data()?.email;
      if (userEmail) {
        // Envoyer le mot de passe par email
        await sendEmail(userEmail, 'Votre nouveau mot de passe',
          `Bonjour,\n\nVotre nouveau mot de passe est : ${generatedPassword}\n\nMerci de le changer après connexion.`);
      }
      // On ne stocke pas le mot de passe dans Firestore
      delete updateData.password;
    }

    await admin.firestore().collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      message: 'Utilisateur mis à jour avec succès',
      passwordSent: !!generatedPassword,
    });
  } catch {
    return res.status(500).json({
      error: 'Erreur lors de la mise à jour de l\'utilisateur',
    });
  }
}

export async function blockUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    // Mettre à jour le statut dans Firestore
    await admin.firestore().collection('users').doc(userId).update({
      statusId: 'BLOCKED',
      updatedAt: new Date(),
    });
    
    // Désactiver le compte dans Firebase Auth
    await admin.auth().updateUser(userId, { disabled: true });
    
    return res.status(200).json({ 
      message: 'Utilisateur bloqué avec succès', 
    });
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors du blocage de l\'utilisateur', 
    });
  }
}

// ===== CONTROLEURS TRANSACTIONS =====
export async function getAllTransactions(req: Request, res: Response) {
  try {
    const queryParams = req.query as TransactionQueryParams;
    const status = queryParams.status;
    const userId = queryParams.userId;
    const limit = queryParams.limit ? parseInt(queryParams.limit) : 50;
    const startAfter = queryParams.startAfter;
    
    let query: FirebaseFirestore.Query = admin.firestore()
      .collection('transfer_orders');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    
    query = query.orderBy('createdAt', 'desc').limit(limit);
    
    if (startAfter) {
      const startAfterDoc = await admin.firestore()
        .collection('transfer_orders')
        .doc(startAfter)
        .get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }
    
    const snapshot = await query.get();
    const transactions: unknown[] = [];
    snapshot.forEach(doc => 
      transactions.push({ id: doc.id, ...doc.data() }),
    );
    
    return res.status(200).json(transactions);
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des transactions', 
    });
  }
}

export async function approveTransaction(
  req: AdminRequest,
  res: Response,
) {
  try {
    const { transactionId } = req.params;
    const transactionRef = admin.firestore()
      .collection('transfer_orders')
      .doc(transactionId);
    const transaction = await transactionRef.get();
    
    if (!transaction.exists) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }
    
    const transactionData = transaction.data() as TransactionData | undefined;
    if (!transactionData || transactionData.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ 
        error: 'La transaction ne peut pas être approuvée dans son ' +
               'état actuel', 
      });
    }
    
    const adminUid = req.admin?.uid ?? 'unknown';
    const body = req.body as ApprovalBody;
    
    await transactionRef.update({
      status: 'PROCESSING',
      timeline: admin.firestore.FieldValue.arrayUnion({
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
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de l\'approbation de la transaction', 
    });
  }
}

// ===== CONTROLEURS KYC =====
export async function getPendingKycRequests(req: Request, res: Response) {
  try {
    const snapshot = await admin.firestore()
      .collection('kyc_profiles')
      .where('statusId', '==', 'PENDING')
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();
      
    const kycRequests: unknown[] = [];
    snapshot.forEach(doc => 
      kycRequests.push({ id: doc.id, ...doc.data() }),
    );
    
    return res.status(200).json(kycRequests);
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des demandes KYC', 
    });
  }
}

export async function approveKyc(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const body = req.body as ApproveKycBody;
    const { levelId, notes } = body;
    
    const kycRef = admin.firestore().collection('kyc_profiles').doc(userId);
    const kycDoc = await kycRef.get();
    
    if (!kycDoc.exists) {
      return res.status(404).json({ error: 'Profil KYC non trouvé' });
    }
    
    const kycData = kycDoc.data() as KycData | undefined;
    
    // Mettre à jour le profil KYC
    await kycRef.update({
      statusId: 'APPROVED',
      levelId: levelId ?? (kycData?.levelId ?? 'L1'),
      notes: notes ?? '',
      updatedAt: new Date(),
    });
    
    // Mettre à jour le niveau KYC de l'utilisateur
    await admin.firestore().collection('users').doc(userId).update({
      kycLevelId: levelId ?? (kycData?.levelId ?? 'L1'),
      updatedAt: new Date(),
    });
    
    return res.status(200).json({ message: 'KYC approuvé avec succès' });
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de l\'approbation du KYC', 
    });
  }
}

// ===== CONTROLEURS DASHBOARD =====
export async function getDashboardStats(req: Request, res: Response) {
  try {
    // Nombre total d'utilisateurs
    const userCountData = await admin.firestore()
      .collection('users')
      .count()
      .get();
    const userCount = userCountData.data().count;
    
    // Nombre de transactions par statut
    const statusCounts: Record<string, number> = {};
    const statusSnapshot = await admin.firestore()
      .collection('transfer_orders')
      .get();
    statusSnapshot.forEach(doc => {
      const docData = doc.data();
      const status = docData.status as string;
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    });
    
    // Nombre de demandes KYC en attente
    const pendingKycCountData = await admin.firestore()
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
  } catch {
    return res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques', 
    });
  }
}