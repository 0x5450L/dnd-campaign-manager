import type { Server as HttpServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { DefaultEventsMap, Server } from 'socket.io';

import type { CampaignSession } from '@prisma/client';

import type {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
  SocketData,
} from '@shared/dto/socketEvents';
import type { CampaignSessionDTO } from '@shared/dto/session';
import { getTokenFromCookie } from '../utils/cookies';
import { verifyToken } from '../utils/jwt';
import {
  requireCampaignAccess,
  requireCampaignDM,
  requireEncounterAccess,
} from '../utils/accessControl';
import { AppError } from '../utils/errors';
import prisma from './prisma';

const campaignRoom = (campaignId: string) => `campaign:${campaignId}`;

const SESSION_IDLE_TIMEOUT_MS = 60 * 60 * 1000;

const isSessionStale = (session: { lastActiveAt: Date | null; startedAt: Date }) => {
  const lastActive = session.lastActiveAt ?? session.startedAt;
  return Date.now() - lastActive.getTime() > SESSION_IDLE_TIMEOUT_MS;
};

const toSessionDTO = (session: CampaignSession): CampaignSessionDTO => ({
  id: session.id,
  number: session.number,
  status: session.status,
  title: session.title,
  summary: session.summary,
  notes: session.notes,
  campaignId: session.campaignId,
  startedAt: session.startedAt.toISOString(),
  updatedAt: session.updatedAt.toISOString(),
  endedAt: session.endedAt ? session.endedAt.toISOString() : null,
});

const findActiveSession = (campaignId: string) =>
  prisma.campaignSession.findFirst({
    where: { campaignId, status: 'active' },
    orderBy: { number: 'desc' },
  });

const broadcastPresence = async (campaignId: string, excludeSocketId?: string) => {
  const sockets = await getIo().in(campaignRoom(campaignId)).fetchSockets();
  const userIds = [
    ...new Set(
      sockets
        .filter((s) => s.id !== excludeSocketId)
        .map((s) => s.data.userId),
    ),
  ];
  getIo().to(campaignRoom(campaignId)).emit('presence_changed', {
    campaignId,
    userIds,
  });

  if (userIds.length > 0) {
    await prisma.campaignSession.updateMany({
      where: { campaignId, status: 'active' },
      data: { lastActiveAt: new Date() },
    });
  }
};

const SESSION_KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000;

const touchOccupiedCampaignSessions = async () => {
  const campaignIds = [...getIo().sockets.adapter.rooms.keys()]
    .filter((room) => room.startsWith('campaign:'))
    .map((room) => room.slice('campaign:'.length));
  if (campaignIds.length === 0) return;

  await prisma.campaignSession.updateMany({
    where: { campaignId: { in: campaignIds }, status: 'active' },
    data: { lastActiveAt: new Date() },
  });
};

const startSessionKeepAlive = () => {
  const timer = setInterval(() => {
    touchOccupiedCampaignSessions().catch((error) => {
      console.error('session keep-alive failed', error);
    });
  }, SESSION_KEEPALIVE_INTERVAL_MS);
  timer.unref();
};

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

  io.use(async (socket, next) => {
    const token = getTokenFromCookie(socket.handshake.headers.cookie);
    if (!token) {
      return next(new Error('Unauthorized'));
    }

    try {
      const userId = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true },
      });
      if (!user) {
        return next(new Error('Unauthorized'));
      }
      socket.data.userId = userId;
      socket.data.displayName = user.displayName;
    } catch (error) {
      return next(new Error('Unauthorized'));
    }
    return next();
  });

  io.on('connection', (socket) => {
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

    socket.on('campaign:join', async (campaignId, ack) => {
      try {
        await requireCampaignAccess(socket.data.userId, campaignId);

        const occupantsBeforeJoin = await getIo().in(campaignRoom(campaignId)).fetchSockets();
        const wasEmpty = occupantsBeforeJoin.length === 0;

        await socket.join(campaignRoom(campaignId));

        let active = await findActiveSession(campaignId);
        if (active && wasEmpty && isSessionStale(active)) {
          await prisma.campaignSession.update({
            where: { id: active.id },
            data: { status: 'ended', endedAt: new Date() },
          });
          getIo()
            .to(campaignRoom(campaignId))
            .emit('session_ended', { campaignId, sessionId: active.id });
          active = null;
        }

        ack({ ok: true, activeSession: active ? toSessionDTO(active) : null });
        await broadcastPresence(campaignId);
      } catch (error) {
        if (error instanceof AppError && error.statusCode === 404) {
          return ack({ ok: false, errorCode: 'forbidden' });
        }
        console.error('campaign:join failed', error);
        ack({ ok: false, errorCode: 'internal' });
      }
    });

    socket.on('campaign:leave', async (campaignId) => {
      await socket.leave(campaignRoom(campaignId));
      await broadcastPresence(campaignId);
    });

    socket.on('session:start', async (payload, ack) => {
      try {
        await requireCampaignDM(socket.data.userId, payload.campaignId);

        let session = await findActiveSession(payload.campaignId);
        if (!session) {
          const { _max } = await prisma.campaignSession.aggregate({
            where: { campaignId: payload.campaignId },
            _max: { number: true },
          });
          const title = payload.title?.trim();
          session = await prisma.campaignSession.create({
            data: {
              campaignId: payload.campaignId,
              number: (_max.number ?? 0) + 1,
              ...(title ? { title } : {}),
            },
          });
        }

        getIo()
          .to(campaignRoom(payload.campaignId))
          .emit('session_started', {
            campaignId: payload.campaignId,
            session: toSessionDTO(session),
          });
        ack({ ok: true });
      } catch (error) {
        if (error instanceof AppError && error.statusCode === 404) {
          return ack({ ok: false, errorCode: 'forbidden' });
        }
        console.error('session:start failed', error);
        ack({ ok: false, errorCode: 'internal' });
      }
    });

    socket.on('session:end', async (payload, ack) => {
      try {
        await requireCampaignDM(socket.data.userId, payload.campaignId);

        const existing = await prisma.campaignSession.findFirst({
          where: { id: payload.sessionId, campaignId: payload.campaignId },
          select: { id: true },
        });
        if (!existing) {
          return ack({ ok: false, errorCode: 'forbidden' });
        }

        await prisma.campaignSession.update({
          where: { id: payload.sessionId },
          data: { status: 'ended', endedAt: new Date() },
        });

        getIo()
          .to(campaignRoom(payload.campaignId))
          .emit('session_ended', {
            campaignId: payload.campaignId,
            sessionId: payload.sessionId,
          });
        ack({ ok: true });
      } catch (error) {
        if (error instanceof AppError && error.statusCode === 404) {
          return ack({ ok: false, errorCode: 'forbidden' });
        }
        console.error('session:end failed', error);
        ack({ ok: false, errorCode: 'internal' });
      }
    });

    socket.on('roll:log', (payload) => {
      const room = campaignRoom(payload.campaignId);
      if (!socket.rooms.has(room)) return;

      getIo().to(room).emit('roll_logged', {
        campaignId: payload.campaignId,
        roll: {
          id: randomUUID(),
          actorName: socket.data.displayName,
          expression: payload.expression,
          total: payload.total,
          critSuccess: payload.critSuccess,
          critFail: payload.critFail,
          at: new Date().toISOString(),
        },
      });
    });

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room.startsWith('campaign:')) {
          void broadcastPresence(room.slice('campaign:'.length), socket.id);
        }
      }
    });

  });

  startSessionKeepAlive();

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
