import type { EncounterParticipantDTO, SessionDiceRollDTO } from "./session";

export type SocketAck<T> = (response: T) => void;

export type JoinAckErrorCode = 'internal' | 'forbidden';
export type JoinAckResponse = { ok: true } | { ok: false, errorCode: JoinAckErrorCode };

export type ParticipantUpdatedPayload = {
  encounterId: string;
  participant: EncounterParticipantDTO;
};

export type RollLogPayload = {
  campaignId: string;
  expression: string;
  total: number;
  critSuccess: boolean;
  critFail: boolean;
};

export type RollLoggedPayload = {
  campaignId: string;
  roll: SessionDiceRollDTO;
};

export type SocketClientToServerEvents = {
  ping: (ack: SocketAck<{ at: number, userId: string }>) => void;
  'encounter:join': (encounterId: string, ack: SocketAck<JoinAckResponse>) => void;
  'encounter:leave': (encounterId: string) => void;
  'campaign:join': (campaignId: string, ack: SocketAck<JoinAckResponse>) => void;
  'campaign:leave': (campaignId: string) => void;
  'roll:log': (payload: RollLogPayload) => void;
}
export type SocketServerToClientEvents = {
  'participant_updated': (payload: ParticipantUpdatedPayload) => void;
  'roll_logged': (payload: RollLoggedPayload) => void;
}

export type SocketData = { userId: string; displayName: string };
