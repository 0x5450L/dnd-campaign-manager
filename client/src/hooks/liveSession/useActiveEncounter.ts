import { useMemo } from "react";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useActiveEncounterQuery } from "@/queries/encounters";

export const useActiveEncounter = () => {
  const sessionId = useLiveSessionStore((s) => s.session?.id);
  const encounterQuery = useActiveEncounterQuery(sessionId);
  const encounter = encounterQuery.data ?? null;

  const participants = useMemo(() => encounter?.participants ?? [], [encounter]);

  const activeParticipant = useMemo(() => {
    if (!encounter || participants.length === 0) return null;
    return participants[encounter.currentTurnIndex] ?? null;
  }, [encounter, participants]);

  return { encounter, participants, activeParticipant };
};
