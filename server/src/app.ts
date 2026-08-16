import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';

import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import campaignsRoutes from './routes/campaigns';
import invitesRoutes from './routes/invites';
import charactersRoutes from './routes/characters';
import sessionsRoutes from './routes/sessions';
import encountersRoutes from './routes/encounters';
import srdRoutes from './routes/srd';
import aiRoutes from './routes/ai';

import { errorMiddleware } from './middleware/errors';

export const createApp = (): Express => {
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
  app.use('/api/srd', srdRoutes);
  app.use('/api/ai', aiRoutes);

  app.use(errorMiddleware);

  return app;
};
