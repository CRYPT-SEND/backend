import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';

// Types personnalisés pour étendre Request
interface AdminRequest extends Request {
  admin?: any;
  adminData?: any;
}

// Middleware d'authentification admin

export async function adminAuthMiddleware(req: AdminRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Vérifier si l'utilisateur est un admin
    const userSnapshot = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    const userData = userSnapshot.data();
    
    if (!userData || userData.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    req.admin = decodedToken;
    req.adminData = userData;
    next();
  } catch (error) {
    console.error('Erreur auth admin:', error);
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// ===== CONTROLEURS UTILISATEURS =====
export async function getAllUsers(req: Request, res: Response) {
  try {
    const usersSnapshot = await admin.firestore().collection('users').limit(100).get();
    const users: any[] = [];
    usersSnapshot.forEach(doc => users.push(doc.data()));
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    return res.status(200).json(userDoc.data());
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Protéger les champs sensibles
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.email; // Pour changer l'email, utiliser Firebase Auth
    
    await admin.firestore().collection('users').doc(userId).update({
      ...updateData,
      updatedAt: new Date()
    });
    
    return res.status(200).json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
}

export async function blockUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    // Mettre à jour le statut dans Firestore
    await admin.firestore().collection('users').doc(userId).update({
      statusId: 'BLOCKED',
      updatedAt: new Date()
    });
    
    // Désactiver le compte dans Firebase Auth
    await admin.auth().updateUser(userId, { disabled: true });
    
    return res.status(200).json({ message: 'Utilisateur bloqué avec succès' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du blocage de l\'utilisateur' });
  }
}

// ===== CONTROLEURS TRANSACTIONS =====
export async function getAllTransactions(req: Request, res: Response) {
  try {
    const status = req.query.status as string;
    const userId = req.query.userId as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const startAfter = req.query.startAfter as string;
    
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = admin.firestore().collection('transfer_orders');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    
    query = query.orderBy('createdAt', 'desc').limit(limit);
    
    if (startAfter) {
      const startAfterDoc = await admin.firestore().collection('transfer_orders').doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }
    
    const snapshot = await query.get();
    const transactions: any[] = [];
    snapshot.forEach(doc => transactions.push({ id: doc.id, ...doc.data() }));
    
    return res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des transactions' });
  }
}

export async function approveTransaction(req: AdminRequest, res: Response) {
  try {
    const { transactionId } = req.params;
    const transactionRef = admin.firestore().collection('transfer_orders').doc(transactionId);
    const transaction = await transactionRef.get();
    
    if (!transaction.exists) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }
    
    const transactionData = transaction.data();
    if (!transactionData || transactionData.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ error: 'La transaction ne peut pas être approuvée dans son état actuel' });
    }
    
    const adminUid = req.admin?.uid || 'unknown';
    
    await transactionRef.update({
      status: 'PROCESSING',
      timeline: admin.firestore.FieldValue.arrayUnion({
        status: 'APPROVED',
        timestamp: new Date(),
        adminId: adminUid,
        note: req.body.note || 'Approuvé par admin'
      }),
      updatedAt: new Date()
    });
    
    return res.status(200).json({ message: 'Transaction approuvée avec succès' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de l\'approbation de la transaction' });
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
      
    const kycRequests: any[] = [];
    snapshot.forEach(doc => kycRequests.push({ id: doc.id, ...doc.data() }));
    
    return res.status(200).json(kycRequests);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des demandes KYC' });
  }
}

export async function approveKyc(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { levelId, notes } = req.body;
    
    const kycRef = admin.firestore().collection('kyc_profiles').doc(userId);
    const kycDoc = await kycRef.get();
    
    if (!kycDoc.exists) {
      return res.status(404).json({ error: 'Profil KYC non trouvé' });
    }
    
    const kycData = kycDoc.data();
    
    // Mettre à jour le profil KYC
    await kycRef.update({
      statusId: 'APPROVED',
      levelId: levelId || (kycData ? kycData.levelId : 'L1'),
      notes: notes || '',
      updatedAt: new Date()
    });
    
    // Mettre à jour le niveau KYC de l'utilisateur
    await admin.firestore().collection('users').doc(userId).update({
      kycLevelId: levelId || (kycData ? kycData.levelId : 'L1'),
      updatedAt: new Date()
    });
    
    return res.status(200).json({ message: 'KYC approuvé avec succès' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de l\'approbation du KYC' });
  }
}

// ===== CONTROLEURS DASHBOARD =====
export async function getDashboardStats(req: Request, res: Response) {
  try {
    // Nombre total d'utilisateurs
    const userCountData = await admin.firestore().collection('users').count().get();
    const userCount = userCountData.data().count;
    
    // Nombre de transactions par statut
    const statusCounts: Record<string, number> = {};
    const statusSnapshot = await admin.firestore().collection('transfer_orders').get();
    statusSnapshot.forEach(doc => {
      const docData = doc.data();
      const status = docData.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
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
      pendingKycCount
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
}