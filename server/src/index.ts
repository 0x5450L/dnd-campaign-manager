import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import prisma from './services/prisma';

const app = express();

app.get('/api/health', async (req, res) => {
  const userCount = await prisma.user.count();
  res.json({ status: 'ok', message: 'Health endpoint', userCount });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});