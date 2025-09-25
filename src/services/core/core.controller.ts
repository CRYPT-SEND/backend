import { Request, Response } from 'express';
import { registerUserWithWallet, transferCusd } from './core.service';

// Interface pour typer le body de la requête d'inscription
interface RegisterWalletBody {
  sessionId: string;
  code: string;
}

// Interface pour typer le body de la requête de transfert
interface TransferBody {
  senderUserId: string;
  recipientPhone: string;
  amount: string;
}

// Types pour les paramètres de requête vides
type EmptyParams = Record<string, never>;
type EmptyQuery = Record<string, never>;

// Handler pour inscription + création de wallet
export async function registerUserWithWalletHandler(
  req: Request<EmptyParams, unknown, RegisterWalletBody, EmptyQuery>, 
  res: Response,
) {
  try {
    const result = await registerUserWithWallet(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
}

// Handler pour transfert cUSD
export async function transferCusdHandler(
  req: Request<EmptyParams, unknown, TransferBody, EmptyQuery>, 
  res: Response,
) {
  try {
    const { senderUserId, recipientPhone, amount } = req.body;
    const result = await transferCusd({ 
      senderUserId, 
      recipientPhone, 
      amount,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: (err as Error).message });
  }
}