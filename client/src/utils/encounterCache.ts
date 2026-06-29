import type {
  EncounterDTO,
  EncounterParticipantDTO,
  EncounterWithParticipantsDTO,
} from "../types/encounter";

export type EncounterList = EncounterWithParticipantsDTO[];

export const mapEncounter = (
  list: EncounterList | undefined,
  encounterId: string,
  fn: (encounter: EncounterWithParticipantsDTO) => EncounterWithParticipantsDTO,
): EncounterList | undefined =>
  list?.map((encounter) => (encounter.id === encounterId ? fn(encounter) : encounter));

export const patchParticipant = (
  list: EncounterList | undefined,
  encounterId: string,
  participantId: string,
  patch: Partial<EncounterParticipantDTO>,
) =>
  mapEncounter(list, encounterId, (encounter) => ({
    ...encounter,
    participants: encounter.participants.map((p) =>
      p.id === participantId ? { ...p, ...patch } : p,
    ),
  }));

export const replaceParticipant = (
  list: EncounterList | undefined,
  encounterId: string,
  participant: EncounterParticipantDTO,
) =>
  mapEncounter(list, encounterId, (encounter) => {
    const exists = encounter.participants.some((p) => p.id === participant.id);
    const participants = exists
      ? encounter.participants.map((p) => (p.id === participant.id ? participant : p))
      : [...encounter.participants, participant];
    return { ...encounter, participants: participants.sort((a, b) => b.sortOrder - a.sortOrder) };
  });

export const removeParticipant = (
  list: EncounterList | undefined,
  encounterId: string,
  participantId: string,
) =>
  mapEncounter(list, encounterId, (encounter) => ({
    ...encounter,
    participants: encounter.participants.filter((p) => p.id !== participantId),
  }));

export const patchEncounterScalar = (list: EncounterList | undefined, encounter: EncounterDTO) =>
  mapEncounter(list, encounter.id, (current) => ({ ...current, ...encounter }));

export const setParticipants = (
  list: EncounterList | undefined,
  encounterId: string,
  participants: EncounterParticipantDTO[],
) => mapEncounter(list, encounterId, (encounter) => ({ ...encounter, participants }));
