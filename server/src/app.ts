import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';

import { config } from './config';

import healthRoutes from './routes/health';
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

const TRUSTED_PROXY_HOPS = 1;

const serveClient = (app: Express, clientDistPath: string) => {
  const indexHtml = path.join(clientDistPath, 'index.html');

  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(indexHtml);
  });
};

export const createApp = (): Express => {
  const app = express();

  app.set('trust proxy', config.isProduction ? TRUSTED_PROXY_HOPS : false);

  if (config.allowedOrigins.length > 0) {
    app.use(cors({ origin: config.allowedOrigins, credentials: true }));
  }

  app.use(cookieParser());
  app.use(express.json({ limit: '256kb' }));

  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/me', meRoutes);
  app.use('/api/campaigns', campaignsRoutes);
  app.use('/api/invites', invitesRoutes);
  app.use('/api/characters', charactersRoutes);
  app.use('/api/sessions', sessionsRoutes);
  app.use('/api/encounters', encountersRoutes);
  app.use('/api/srd', srdRoutes);
  app.use('/api/ai', aiRoutes);

  if (config.clientDistPath) {
    serveClient(app, config.clientDistPath);
  }

  app.use(errorMiddleware);

  return app;
};
