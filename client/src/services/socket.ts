import { io, type Socket } from "socket.io-client";
import type {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "../../../shared/socketEvents";

export type AppSocket = Socket<
  SocketServerToClientEvents,
  SocketClientToServerEvents
>;

let socket: AppSocket | null = null;

export const getSocket = (): AppSocket => {
  if (!socket) {
    socket = io({ withCredentials: true });
  }
  return socket;
};
