import { createContext } from "react";
import type {
  CampaignSessionDTO,
  EncounterDTO,
  EncounterParticipantDTO,
  MemberPresence,
  PresenceStatus,
  SessionEvent,
} from "../../types/session";
import type { ParticipantPatch } from "../../state/liveSession/liveSessionReducer";

export type LiveSessionContextType = {
  session: CampaignSessionDTO | null;
  encounter: EncounterDTO | null;
  participants: EncounterParticipantDTO[];
  presence: MemberPresence[];
  events: SessionEvent[];

  presenceFor: (userId: string) => PresenceStatus;
  activeParticipant: EncounterParticipantDTO | null;
  connectedCount: number;

  startSession: () => void;
  endSession: () => void;
  togglePresence: (userId: string) => void;

  startEncounter: () => void;
  endEncounter: () => void;
  advanceTurn: () => void;

  adjustHp: (participantId: string, delta: number) => void;
  grantTempHp: (participantId: string, amount: number) => void;
  toggleCondition: (participantId: string, condition: string) => void;
  setVisibility: (participantId: string, isVisible: boolean) => void;
  setAcHidden: (participantId: string, acHidden: boolean) => void;
  recordDeathSave: (
    participantId: string,
    outcome: "success" | "failure",
  ) => void;
  resetDeathSaves: (participantId: string) => void;
  updateParticipant: (participantId: string, patch: ParticipantPatch) => void;
};

export const LiveSessionContext = createContext<LiveSessionContextType | null>(null);
