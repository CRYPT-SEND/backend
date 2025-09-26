import { Router } from 'express';
import {
  registerUserWithWalletHandler,
  transferCusdHandler,
} from './core.controller';

const router = Router();

// Route pour inscription + création de wallet
router.post('/register', registerUserWithWalletHandler);

// Route pour transfert cUSD
router.post('/transfer', transferCusdHandler);

export default router;