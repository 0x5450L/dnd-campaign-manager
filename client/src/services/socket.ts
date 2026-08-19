import { io, type Socket } from "socket.io-client";
import type {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "@dnd/shared/dto/socketEvents";

export type AppSocket = Socket<
  SocketServerToClientEvents,
  SocketClientToServerEvents
>;

let socket: AppSocket | null = null;

/**
 * `auth` is a callback rather than a value so the token is read again on every
 * reconnect: the socket outlives a login, and a stale handshake would
 * authenticate as whoever signed in before.
 */
export const getSocket = (): AppSocket => {
  if (!socket) {
    socket = io({
      withCredentials: true,
      auth: (cb) => cb({ token: localStorage.getItem("dndCampaignManagerJWT") }),
    });
  }
  return socket;
};

export const resetSocket = () => {
  socket?.disconnect();
  socket = null;
};
