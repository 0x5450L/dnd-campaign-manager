import { EncounterParticipantDTO } from "./session";

export type SocketAck<T> = (response: T) => void;

export type JoinAckErrorCode = 'internal' | 'forbidden';
export type JoinAckResponse = { ok: true } | { ok: false, errorCode: JoinAckErrorCode };

export type ParticipantUpdatedPayload = {
  encounterId: string;
  participant: EncounterParticipantDTO;
};

export type SocketClientToServerEvents = {
  ping: (ack: SocketAck<{ at: number, userId: string }>) => void;
  'encounter:join': (encounterId: string, ack: SocketAck<JoinAckResponse>) => void;
  'encounter:leave': (encounterId: string) => void;
}
export type SocketServerToClientEvents = {
  'participant_updated': (payload: ParticipantUpdatedPayload) => void;
}

export type SocketData = { userId: string };