import { useCallback, useMemo } from "react";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import {
  useAbilityUsageMutation,
  useActiveEncounterQuery,
  useCreateParticipantMutation,
  useRemoveParticipantMutation,
  useRollInitiativeMutation,
  useUpdateParticipantMutation,
} from "@/queries/encounters";
import {
  applyDamage,
  applyHealing,
  applyTempHp,
  incrementDeathSave,
  toggleConditionInList,
} from "@/utils/encounterParticipant";
import type {
  AbilityUsageAction,
  CreateParticipantPayload,
  UpdateParticipantPayload,
} from "@/types/encounter";

export const useParticipantActions = () => {
  const sessionId = useLiveSessionStore((s) => s.session?.id);
  const encounterQuery = useActiveEncounterQuery(sessionId);
  const encounter = encounterQuery.data ?? null;
  const participants = useMemo(() => encounter?.participants ?? [], [encounter]);

  const { mutate: mutateParticipant } = useUpdateParticipantMutation(sessionId);
  const { mutate: mutateAbilityUsage } = useAbilityUsageMutation(sessionId);
  const { mutate: mutateRollInitiative } = useRollInitiativeMutation(sessionId);
  const { mutate: mutateCreateParticipant } = useCreateParticipantMutation(sessionId);
  const { mutate: mutateRemoveParticipant } = useRemoveParticipantMutation(sessionId);

  const adjustHp = useCallback(
    (participantId: string, delta: number) => {
      if (!encounter) return;
      const target = participants.find((p) => p.id === participantId);
      if (!target) return;

      const next = delta < 0 ? applyDamage(target, -delta) : applyHealing(target, delta);
      const revived = target.currentHp === 0 && next.currentHp > 0;
      mutateParticipant({
        encounterId: encounter.id,
        participantId,
        payload: {
          currentHp: next.currentHp,
          tempHp: next.tempHp,
          ...(revived ? { deathSaveSuccesses: 0, deathSaveFailures: 0 } : {}),
        },
      });
    },
    [encounter, participants, mutateParticipant],
  );

  const grantTempHp = useCallback(
    (participantId: string, amount: number) => {
      if (!encounter) return;
      const target = participants.find((p) => p.id === participantId);
      if (!target) return;
      const next = applyTempHp(target, amount);
      mutateParticipant({ encounterId: encounter.id, participantId, payload: { tempHp: next.tempHp } });
    },
    [encounter, participants, mutateParticipant],
  );

  const toggleCondition = useCallback(
    (participantId: string, condition: string) => {
      if (!encounter) return;
      const target = participants.find((p) => p.id === participantId);
      if (!target) return;
      const conditions = toggleConditionInList(target.conditions, condition);
      mutateParticipant({ encounterId: encounter.id, participantId, payload: { conditions } });
    },
    [encounter, participants, mutateParticipant],
  );

  const setVisibility = useCallback(
    (participantId: string, isVisible: boolean) => {
      if (!encounter) return;
      mutateParticipant({ encounterId: encounter.id, participantId, payload: { isVisible } });
    },
    [encounter, mutateParticipant],
  );

  const setAcHidden = useCallback(
    (participantId: string, acHidden: boolean) => {
      if (!encounter) return;
      mutateParticipant({ encounterId: encounter.id, participantId, payload: { acHidden } });
    },
    [encounter, mutateParticipant],
  );

  const setShield = useCallback(
    (participantId: string, usesShield: boolean) => {
      if (!encounter) return;
      mutateParticipant({ encounterId: encounter.id, participantId, payload: { usesShield } });
    },
    [encounter, mutateParticipant],
  );

  const recordDeathSave = useCallback(
    (participantId: string, outcome: "success" | "failure") => {
      if (!encounter) return;
      const target = participants.find((p) => p.id === participantId);
      if (!target) return;
      const saves = incrementDeathSave(target, outcome);
      mutateParticipant({
        encounterId: encounter.id,
        participantId,
        payload: saves,
      });
    },
    [encounter, participants, mutateParticipant],
  );

  const resetDeathSaves = useCallback(
    (participantId: string) => {
      if (!encounter) return;
      mutateParticipant({
        encounterId: encounter.id,
        participantId,
        payload: { deathSaveSuccesses: 0, deathSaveFailures: 0 },
      });
    },
    [encounter, mutateParticipant],
  );

  const updateParticipant = useCallback(
    (participantId: string, payload: UpdateParticipantPayload) => {
      if (!encounter) return;
      mutateParticipant({ encounterId: encounter.id, participantId, payload });
    },
    [encounter, mutateParticipant],
  );

  const rollInitiative = useCallback(
    (participantIds?: string[]) => {
      if (!encounter) return;
      mutateRollInitiative({ encounterId: encounter.id, participantIds });
    },
    [encounter, mutateRollInitiative],
  );

  const applyAbilityUsage = useCallback(
    (participantId: string, abilityId: string, action: AbilityUsageAction) => {
      if (!encounter) return;
      mutateAbilityUsage({ encounterId: encounter.id, participantId, abilityId, action });
    },
    [encounter, mutateAbilityUsage],
  );

  const addParticipant = useCallback(
    (input: CreateParticipantPayload) => {
      if (!encounter) return;
      mutateCreateParticipant({ encounterId: encounter.id, payload: input });
    },
    [encounter, mutateCreateParticipant],
  );

  const removeParticipant = useCallback(
    (participantId: string) => {
      if (!encounter) return;
      mutateRemoveParticipant({ encounterId: encounter.id, participantId });
    },
    [encounter, mutateRemoveParticipant],
  );

  return useMemo(
    () => ({
      adjustHp,
      grantTempHp,
      toggleCondition,
      setVisibility,
      setAcHidden,
      setShield,
      recordDeathSave,
      resetDeathSaves,
      updateParticipant,
      rollInitiative,
      applyAbilityUsage,
      addParticipant,
      removeParticipant,
    }),
    [
      adjustHp,
      grantTempHp,
      toggleCondition,
      setVisibility,
      setAcHidden,
      setShield,
      recordDeathSave,
      resetDeathSaves,
      updateParticipant,
      rollInitiative,
      applyAbilityUsage,
      addParticipant,
      removeParticipant,
    ],
  );
};
