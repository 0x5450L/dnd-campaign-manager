import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import campaignsRoutes from './routes/campaigns';
import invitesRoutes from './routes/invites';
import charactersRoutes from './routes/characters';
import sessionsRoutes from './routes/sessions';
import encountersRoutes from './routes/encounters';

import { errorMiddleware } from './middleware/errors';
import { createServer } from 'node:http';
import { initSocket } from './services/socket';

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/invites', invitesRoutes);
app.use('/api/characters', charactersRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/encounters', encountersRoutes);

app.use(errorMiddleware);

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
