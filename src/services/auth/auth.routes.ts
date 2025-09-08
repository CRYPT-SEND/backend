import { Router, Request, Response } from 'express';
import * as authController from './auth.controller';
const router = Router();

// Endpoint de base
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'AuthService',
    timestamp: new Date(),
    message: 'Authentication service is running',
  });
});

// Routes d'authentification
// router.post('/login', authController.login);
router.post('/register', authController.register);
// router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout)
  .use(authController.authenticateFirebaseToken);
router.post('/2fa/verify', authController.twofaVerify)
  .use(authController.authenticateFirebaseToken);
router.post('/2fa/setup', authController.twofaSetup)
  .use(authController.authenticateFirebaseToken);


//kyc routes
router.get('/kyc/profile', authController.kycProfile)
  .use(authController.authenticateFirebaseToken);
router.get('/kyc/documents', authController.kycDocuments)
  .use(authController.authenticateFirebaseToken);
// router.post('admin/kyc/{kyc_id}/review', authController.kycReview);
export default router;