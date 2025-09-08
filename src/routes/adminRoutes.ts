import express from 'express';
import * as adminController from '../controllers/adminController';
import * as superAdminController from '../controllers/superAdminController';

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
// router.use(adminController.adminAuthMiddleware);

// Routes utilisateurs
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId', adminController.updateUser);
router.post('/users/:userId/block', adminController.blockUser);

// Routes transactions
router.get('/transactions', adminController.getAllTransactions);
router.post('/transactions/:transactionId/approve', adminController.approveTransaction);

// Routes KYC
router.get('/kyc/pending', adminController.getPendingKycRequests);
router.post('/kyc/:userId/approve', adminController.approveKyc);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

export default router;