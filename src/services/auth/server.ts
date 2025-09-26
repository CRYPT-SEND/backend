import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './auth.routes';

dotenv.config({ path: './config/.env.development' });

const app = express();
const PORT = process.env.PORT_AUTH ?? '3001';

app.use(express.json());

// Routes d'authentification (inscription, connexion, etc.)
app.use('/api/auth', authRoutes);

app.get('/', (_req, res) => {
  res.send('Auth service is running!');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Auth server listening on port ${PORT}`);
});