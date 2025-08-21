import { Router, Request, Response } from 'express';


const router = Router();

// Endpoint de base
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});