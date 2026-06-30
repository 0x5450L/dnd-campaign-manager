import type {
  EncounterDTO,
  EncounterParticipantDTO,
  EncounterWithParticipantsDTO,
  EncounterStatus,
  ParticipantAbilityScore,
  ParticipantType,
  SpellSlotLevel,
  CreateEncounterPayload,
  UpdateEncounterPayload,
  CreateParticipantPayload,
  UpdateParticipantPayload,
  BulkInitiativePayload,
  BulkCreateParticipantsPayload,
} from "../../../shared/dto/session";

export type {
  EncounterDTO,
  EncounterParticipantDTO,
  EncounterWithParticipantsDTO,
  EncounterStatus,
  ParticipantAbilityScore,
  ParticipantType,
  SpellSlotLevel,
  CreateEncounterPayload,
  UpdateEncounterPayload,
  CreateParticipantPayload,
  UpdateParticipantPayload,
  BulkInitiativePayload,
  BulkCreateParticipantsPayload,
};

export type ListEncountersResponse = {
  status: string;
  encounters: EncounterWithParticipantsDTO[];
};

export type GetEncounterResponse = {
  status: string;
  encounter: EncounterWithParticipantsDTO;
};

export type CreateEncounterResponse = {
  status: string;
  message: string;
  encounter: EncounterWithParticipantsDTO;
};

export type UpdateEncounterResponse = {
  status: string;
  encounter: EncounterDTO;
};

export type DeleteEncounterResponse = {
  status: string;
  message: string;
};

export type NextTurnResponse = {
  status: string;
  encounter: EncounterDTO;
};

export type SetInitiativeResponse = {
  status: string;
  participants: EncounterParticipantDTO[];
};

export type CreateParticipantResponse = {
  status: string;
  participant: EncounterParticipantDTO;
};

export type BulkCreateParticipantsResponse = {
  status: string;
  participants: EncounterParticipantDTO[];
};

export type UpdateParticipantResponse = {
  status: string;
  participant: EncounterParticipantDTO;
};

export type DeleteParticipantsResponse = {
  status: string;
  message: string;
  deletedIds: string[];
};

export type DeleteParticipantResponse = {
  status: string;
  message: string;
};
