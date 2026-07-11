import type { EncounterParticipantDTO } from "../encounter";

export type EditorBodyProps = {
  draft: EncounterParticipantDTO;
  updateDraft: (fields: Partial<EncounterParticipantDTO>) => void;
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
