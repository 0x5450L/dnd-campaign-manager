import type { EncounterParticipantDTO, UpdateParticipantPayload } from "../encounter";

export type EditorBodyProps = {
  participant: EncounterParticipantDTO;
  patchParticipant: (fields: UpdateParticipantPayload) => void;
  canEditOwn: boolean;
  canManage: boolean;
};

export type StatBlockSize = "md" | "lg";

export type StatBlockSizeStyles = {
  box: string;
  label: string;
  value: string;
  input: string;
};
