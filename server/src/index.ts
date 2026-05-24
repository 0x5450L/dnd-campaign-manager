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
import { DefaultEventsMap, Server } from 'socket.io';
import { getTokenFromCookie } from './utils/cookies';
import { verifyToken } from './utils/jwt';

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

type ClientToServerEvents = {
  ping: (ack: (response: { at: number, userId: string }) => void) => void
}
type ServerToClientEvents = {}

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, { userId: string }>(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = getTokenFromCookie(socket.handshake.headers.cookie);
  if (!token) {
    return next(new Error('Unauthorized'));
  }

  try {
    const userId = verifyToken(token);
    socket.data.userId = userId;
  } catch (error) {
    return next(new Error('Unauthorized'));
  }
  return next();
});

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`);
  socket.on('ping', (ack) => {
    ack({ at: Date.now(), userId: socket.data.userId });
  });
  
  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);
  });
});

httpServer.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});