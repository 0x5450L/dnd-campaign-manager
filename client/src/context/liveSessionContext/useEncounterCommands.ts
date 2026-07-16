import { useCallback, useMemo } from "react";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import {
  useActiveEncounterQuery,
  useAdvanceTurnMutation,
  useCreateEncounterMutation,
  useUpdateEncounterMutation,
} from "@/queries/encounters";

export const useEncounterCommands = () => {
  const sessionId = useLiveSessionStore((s) => s.session?.id);
  const encounterQuery = useActiveEncounterQuery(sessionId);
  const encounter = encounterQuery.data ?? null;

  const { mutate: mutateCreateEncounter } = useCreateEncounterMutation(sessionId);
  const { mutate: mutateUpdateEncounter } = useUpdateEncounterMutation(sessionId);
  const { mutate: mutateAdvanceTurn } = useAdvanceTurnMutation(sessionId);

  const startEncounter = useCallback(() => {
    if (!sessionId) return;
    mutateCreateEncounter({});
  }, [sessionId, mutateCreateEncounter]);

  const beginCombat = useCallback(() => {
    if (!encounter) return;
    mutateUpdateEncounter({ encounterId: encounter.id, payload: { status: "active" } });
  }, [encounter, mutateUpdateEncounter]);

  const endEncounter = useCallback(() => {
    if (!encounter) return;
    mutateUpdateEncounter({ encounterId: encounter.id, payload: { status: "ended" } });
  }, [encounter, mutateUpdateEncounter]);

  const advanceTurn = useCallback(() => {
    if (!encounter) return;
    mutateAdvanceTurn(encounter.id);
  }, [encounter, mutateAdvanceTurn]);

  return useMemo(
    () => ({ startEncounter, beginCombat, endEncounter, advanceTurn }),
    [startEncounter, beginCombat, endEncounter, advanceTurn],
  );
};
