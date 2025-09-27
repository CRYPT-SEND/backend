"use strict";
// import { Router } from 'express';
// import * as blockchainController from './blockchain.controller';
// import { newKit } from '@celo/contractkit';
// import dotenv from 'dotenv';
// dotenv.config({ path: './config/.env.development' });
// const CELO_RPC_URL = process.env.CELO_RPC_URL ?? 
//   'https://alfajores-forno.celo-testnet.org';
// const kit = newKit(CELO_RPC_URL);
// const router = Router();
// router.post('/create', blockchainController.createWallet);
// router.get('/cusd-balance/:address', blockchainController.getCusdBalance);
// router.post('/send-cusd', blockchainController.sendCusd);
// // Endpoint de diagnostic pour vérifier la connexion au réseau Celo
// router.get('/celo-status', async (_req, res) => {
//   try {
//     const blockNumber = await kit.connection.web3.eth.getBlockNumber();
//     res.json({ connected: true, blockNumber });
//   } catch (err) {
//     res.status(500).json({ connected: false, error: (err as Error).message });
//   }
// });
// // Diagnostic automatique au lancement du service
// (async () => {
//   try {
//     const blockNumber = await kit.connection.web3.eth.getBlockNumber();
//     // eslint-disable-next-line no-console
//     console.log(`✅ Connecté à Celo. Numéro de bloc actuel : ${blockNumber}`);
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error(
//       '❌ Impossible de se connecter à Celo :', 
//       (err as Error).message,
//     );
//   }
// })();
// export default router;
