import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import prisma from './services/prisma';
import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import campaignsRoutes from './routes/campaigns';
import invitesRoutes from './routes/invites';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/invites', invitesRoutes);

app.get('/api/health', async (req, res) => {
  const userCount = await prisma.user.count();
  res.json({ status: 'ok', message: 'Health endpoint', userCount });
});


app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});