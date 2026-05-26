import type { Server as HttpServer } from 'node:http';
import { DefaultEventsMap, Server } from 'socket.io';

import type {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
  SocketData,
} from '../../../shared/socketEvents';
import { getTokenFromCookie } from '../utils/cookies';
import { verifyToken } from '../utils/jwt';
import { requireEncounterAccess } from '../utils/accessControl';
import { AppError } from '../utils/errors';

export type AppIo = Server<
  SocketClientToServerEvents,
  SocketServerToClientEvents,
  DefaultEventsMap,
  SocketData
>;

let io: AppIo | null = null;

export const initSocket = (httpServer: HttpServer): AppIo => {
  if (io) {
    throw new Error('Socket.io is already initialized');
  }

  io = new Server<SocketClientToServerEvents, SocketServerToClientEvents, DefaultEventsMap, SocketData>
    (httpServer, {
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

    socket.on('encounter:join', async (encounterId, ack) => {
      try {
        await requireEncounterAccess(socket.data.userId, encounterId);
        await socket.join(`encounter:${encounterId}`);
        ack({ ok: true });
      } catch (error) {
        if (error instanceof AppError && error.statusCode === 404) {
          return ack({ ok: false, errorCode: 'forbidden' });
        }
        console.error('encounter:join failed', error);
        ack({ ok: false, errorCode: 'internal' });
      }
    });

    socket.on('encounter:leave', (encounterId) => {
      socket.leave(`encounter:${encounterId}`);
    });

    socket.on('disconnect', () => {
      console.log(`${socket.id} disconnected`);
    });
  });

  return io;
};

export const getIo = (): AppIo => {
  if (!io) {
    throw new Error(
      'Socket.io is not initialized. Call initSocket(httpServer) first.',
    );
  }
  return io;
};