import { createContext } from "react";
import type {
  CampaignSessionDTO,
  MemberPresence,
  PresenceStatus,
  SessionDiceRoll,
  SessionEvent,
} from "../../types/session";
import type {
  EncounterDTO,
  EncounterParticipantDTO,
  UpdateParticipantPayload,
} from "../../types/encounter";
import type { SessionRollInput } from "../../state/liveSession/liveSessionReducer";

export type LiveSessionContextType = {
  session: CampaignSessionDTO | null;
  encounter: EncounterDTO | null;
  participants: EncounterParticipantDTO[];
  presence: MemberPresence[];
  events: SessionEvent[];
  rolls: SessionDiceRoll[];

  presenceFor: (userId: string) => PresenceStatus;
  activeParticipant: EncounterParticipantDTO | null;
  connectedCount: number;

  startSession: () => void;
  endSession: () => void;

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
  updateParticipant: (participantId: string, payload: UpdateParticipantPayload) => void;
  logRoll: (roll: SessionRollInput) => void;
};

export const LiveSessionContext = createContext<LiveSessionContextType | null>(null);
