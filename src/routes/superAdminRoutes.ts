import express from 'express';
import * as adminManagementController 
  from '../controllers/superAdminController';

const router = express.Router();

// Appliquer le middleware de super admin à toutes les routes
// router.use(adminManagementController.superAdminAuthMiddleware);

// Routes de gestion des administrateurs
router.post('/admins', adminManagementController.createAdmin);
router.get('/admins', adminManagementController.getAllAdmins);
router.get('/admins/:adminId', adminManagementController.getAdminById);
router.put('/admins/:adminId', adminManagementController.updateAdmin);
router.delete('/admins/:adminId', adminManagementController.deleteAdmin);
router.post('/admins/:adminId/reset-password', adminManagementController.resetAdminPassword);

export default router;