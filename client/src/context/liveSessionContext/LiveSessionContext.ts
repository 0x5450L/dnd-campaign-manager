import { createContext } from "react";
import type {
  CampaignSessionDTO,
  EncounterDTO,
  EncounterParticipantDTO,
  MemberPresence,
  PresenceStatus,
  SessionEvent,
} from "../../types/session";

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
  toggleCondition: (participantId: string, condition: string) => void;
};

export const LiveSessionContext = createContext<LiveSessionContextType | null>(null);
