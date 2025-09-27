"use strict";
// import { Request, Response } from 'express';
// import * as blockchainService from './blockchain.service';
// // Interface pour typer le body de sendCusd
// interface SendCusdBody {
//   privateKey?: string;
//   to?: string;
//   amount?: string;
// }
// // Types pour les paramètres de requête
// type EmptyParams = Record<string, never>;
// type EmptyQuery = Record<string, never>;
// // Créer un wallet Celo
// export function createWallet(req: Request, res: Response) {
//   const wallet = blockchainService.createWallet();
//   // ⚠️ Ne jamais renvoyer la clé privée en production !
//   res.json({
//     address: wallet.address,
//     mnemonic: wallet.mnemonic,
//     // privateKey: wallet.privateKey, // Ne pas exposer sauf cas très 
//     // particulier
//   });
// }
// // Récupérer le solde cUSD d'une adresse
// export async function getCusdBalance(req: Request, res: Response) {
//   const { address } = req.params;
//   try {
//     const balance = await blockchainService.getCusdBalance(address);
//     res.json({ address, balance });
//   } catch (err) {
//     res.status(400).json({ 
//       error: 'Impossible de récupérer le solde', 
//       details: (err as Error).message,
//     });
//   }
// }
// // Envoyer des cUSD depuis un wallet
// export async function sendCusd(
//   req: Request<EmptyParams, unknown, SendCusdBody, EmptyQuery>, 
//   res: Response,
// ) {
//   const { privateKey, to, amount } = req.body;
//   if (!privateKey || !to || !amount) {
//     return res.status(400).json({ 
//       error: 'privateKey, to et amount sont requis',
//     });
//   }
//   try {
//     const result = await blockchainService.sendCusd(privateKey, to, amount);
//     res.json({ txHash: result.txHash });
//   } catch (err) {
//     res.status(400).json({ 
//       error: 'Transaction échouée', 
//       details: (err as Error).message,
//     });
//   }
// }
