import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import prisma from './services/prisma';
import authRoutes from './routes/auth'; 

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/health', async (req, res) => {
  const userCount = await prisma.user.count();
  res.json({ status: 'ok', message: 'Health endpoint', userCount });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});