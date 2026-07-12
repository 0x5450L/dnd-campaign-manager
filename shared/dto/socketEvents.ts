import type {
  CampaignSessionDTO,
  EncounterDTO,
  EncounterParticipantDTO,
  SessionDiceRollDTO,
} from "./session";

export type SocketAck<T> = (response: T) => void;

export type JoinAckErrorCode = 'internal' | 'forbidden';
export type JoinAckResponse = { ok: true } | { ok: false, errorCode: JoinAckErrorCode };

export type CampaignJoinAckResponse =
  | { ok: true; activeSession: CampaignSessionDTO | null }
  | { ok: false; errorCode: JoinAckErrorCode };

export type SessionAckErrorCode = 'internal' | 'forbidden';
export type SessionAckResponse =
  | { ok: true }
  | { ok: false; errorCode: SessionAckErrorCode };

export type SessionStartPayload = { campaignId: string; title?: string };
export type SessionEndPayload = { campaignId: string; sessionId: string };

export type SessionStartedPayload = {
  campaignId: string;
  session: CampaignSessionDTO;
};
export type SessionEndedPayload = { campaignId: string; sessionId: string };

export type PresenceChangedPayload = {
  campaignId: string;
  userIds: string[];
};

export type ParticipantUpdatedPayload = {
  campaignId: string;
  encounterId: string;
  participant: EncounterParticipantDTO;
};

export type ParticipantRemovedPayload = {
  campaignId: string;
  encounterId: string;
  participantId: string;
};

export type EncounterUpdatedPayload = {
  campaignId: string;
  encounter: EncounterDTO;
};

export type InitiativeUpdatedPayload = {
  campaignId: string;
  encounterId: string;
  participants: EncounterParticipantDTO[];
};

export type RechargeRollDTO = {
  abilityId: string;
  abilityName: string;
  roll: number;
  threshold: number;
  charged: boolean;
};

export type TurnAdvancedPayload = {
  campaignId: string;
  encounter: EncounterDTO;
  participant: EncounterParticipantDTO | null;
  rechargeRolls: RechargeRollDTO[];
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
  'campaign:join': (campaignId: string, ack: SocketAck<CampaignJoinAckResponse>) => void;
  'campaign:leave': (campaignId: string) => void;
  'roll:log': (payload: RollLogPayload) => void;
  'session:start': (payload: SessionStartPayload, ack: SocketAck<SessionAckResponse>) => void;
  'session:end': (payload: SessionEndPayload, ack: SocketAck<SessionAckResponse>) => void;
}
export type SocketServerToClientEvents = {
  'participant_updated': (payload: ParticipantUpdatedPayload) => void;
  'participant_removed': (payload: ParticipantRemovedPayload) => void;
  'encounter_updated': (payload: EncounterUpdatedPayload) => void;
  'turn_advanced': (payload: TurnAdvancedPayload) => void;
  'initiative_updated': (payload: InitiativeUpdatedPayload) => void;
  'roll_logged': (payload: RollLoggedPayload) => void;
  'session_started': (payload: SessionStartedPayload) => void;
  'session_ended': (payload: SessionEndedPayload) => void;
  'presence_changed': (payload: PresenceChangedPayload) => void;
}

export type SocketData = { userId: string; displayName: string };
