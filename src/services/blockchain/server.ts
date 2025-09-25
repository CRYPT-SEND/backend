import express from 'express';
import dotenv from 'dotenv';
// import blockchainRoutes from './blockchain.routes';
dotenv.config({ path: './config/.env.development' });

const app = express();
const PORT = process.env.PORT_BLOCKCHAIN ?? '3002';

app.use(express.json());

// Routes blockchain (wallet, usdt, etc.)
// app.use('/api/wallet', blockchainRoutes);

app.get('/', (_req, res) => {
  res.send('Blockchain service is running!');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Blockchain server listening on port ${PORT}`);
});