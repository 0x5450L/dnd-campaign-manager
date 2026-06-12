import type {
  CampaignSessionDTO,
  EncounterDTO,
  EncounterParticipantDTO,
  ParticipantAbilityScore,
  ParticipantType,
  SessionStatus,
  EncounterStatus,
  SpellSlotLevel,
  SessionDiceRollDTO,
} from "../../../shared/session";

export type {
  CampaignSessionDTO,
  EncounterDTO,
  EncounterParticipantDTO,
  ParticipantAbilityScore,
  ParticipantType,
  SessionStatus,
  EncounterStatus,
  SpellSlotLevel,
};

export type SessionDiceRoll = SessionDiceRollDTO;

export type PresenceStatus = "connected" | "away" | "offline";

export type MemberPresence = {
  userId: string;
  status: PresenceStatus;
};

export type SessionEventKind =
  | "session_started"
  | "session_ended"
  | "member_joined"
  | "member_left"
  | "encounter_started"
  | "encounter_ended"
  | "turn_advanced"
  | "hp_changed"
  | "condition_added"
  | "condition_removed"
  | "dice_rolled"
  | "note";

export type SessionEvent = {
  id: string;
  kind: SessionEventKind;
  message: string;
  at: string;
  actorName?: string;
};

