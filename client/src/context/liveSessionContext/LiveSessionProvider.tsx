import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { LiveSessionContext, type LiveSessionContextType } from "./LiveSessionContext";
import { useSessionCommands } from "./useSessionCommands";
import { useEncounterCommands } from "./useEncounterCommands";
import { useParticipantActions } from "./useParticipantActions";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import type { MemberPresence, PresenceStatus } from "@/types/session";
import type { EncounterParticipantDTO } from "@/types/encounter";
import { useMeQuery } from "@/queries/auth";
import { useCampaignCharactersQuery } from "@/queries/characters";
import type { Campaign } from "@/types/campaigns";
import {
  useActiveEncounterQuery,
  useEncounterRealtimeSync,
} from "@/queries/encounters";

type Props = {
  campaign: Campaign;
  children: ReactNode;
};

const presenceFromUserIds = (
  campaign: Campaign,
  connectedUserIds: string[],
): MemberPresence[] => {
  const connected = new Set(connectedUserIds);
  return campaign.members.map((m) => ({
    userId: m.userId,
    status: connected.has(m.userId) ? "connected" : "offline",
  }));
};

export const LiveSessionProvider = ({ campaign, children }: Props) => {
  const session = useLiveSessionStore((s) => s.session);
  const connectedUserIds = useLiveSessionStore((s) => s.connectedUserIds);
  const events = useLiveSessionStore((s) => s.events);
  const rolls = useLiveSessionStore((s) => s.rolls);
  const setActiveCampaign = useLiveSessionStore((s) => s.setActiveCampaign);

  const sessionId = session?.id;
  const encounterQuery = useActiveEncounterQuery(sessionId);
  const encounter = encounterQuery.data ?? null;
  const participants = useMemo(() => encounter?.participants ?? [], [encounter]);

  const { data: user } = useMeQuery();
  const { data: campaignCharacters } = useCampaignCharactersQuery(campaign.id);
  const myCharacterIds = useMemo(
    () =>
      new Set(
        (campaignCharacters ?? [])
          .filter((c) => c.userId === user?.id)
          .map((c) => c.id),
      ),
    [campaignCharacters, user?.id],
  );
  const isOwnParticipant = useCallback(
    (participant: EncounterParticipantDTO) =>
      participant.characterId !== null && myCharacterIds.has(participant.characterId),
    [myCharacterIds],
  );

  useEncounterRealtimeSync(campaign.id, sessionId);

  useEffect(() => {
    setActiveCampaign(campaign.id);
  }, [campaign.id, setActiveCampaign]);

  const presence = useMemo(
    () => presenceFromUserIds(campaign, connectedUserIds),
    [campaign, connectedUserIds],
  );

  const sessionCommands = useSessionCommands();
  const encounterCommands = useEncounterCommands();
  const participantActions = useParticipantActions();

  const presenceFor = useCallback(
    (userId: string): PresenceStatus =>
      presence.find((p) => p.userId === userId)?.status ?? "offline",
    [presence],
  );

  const activeParticipant = useMemo(() => {
    if (!encounter || participants.length === 0) return null;
    return participants[encounter.currentTurnIndex] ?? null;
  }, [encounter, participants]);

  const connectedCount = useMemo(
    () => presence.filter((p) => p.status === "connected").length,
    [presence],
  );

  const value = useMemo<LiveSessionContextType>(
    () => ({
      session,
      encounter,
      participants,
      presence,
      events,
      rolls,

      presenceFor,
      isOwnParticipant,
      activeParticipant,
      connectedCount,

      ...sessionCommands,
      ...encounterCommands,
      ...participantActions,
    }),
    [
      session,
      encounter,
      participants,
      presence,
      events,
      rolls,
      presenceFor,
      isOwnParticipant,
      activeParticipant,
      connectedCount,
      sessionCommands,
      encounterCommands,
      participantActions,
    ],
  );

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  );
};
