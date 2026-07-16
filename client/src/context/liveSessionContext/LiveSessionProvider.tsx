import {
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { LiveSessionContext, type LiveSessionContextType } from "./LiveSessionContext";
import { getSocket } from "@/services/socket";
import type { SessionRollInput } from "@/state/liveSession/liveSessionReducer";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import type { MemberPresence, PresenceStatus } from "@/types/session";
import type {
  AbilityUsageAction,
  CreateParticipantPayload,
  EncounterParticipantDTO,
  UpdateParticipantPayload,
} from "@/types/encounter";
import { useMeQuery } from "@/queries/auth";
import { useCampaignCharactersQuery } from "@/queries/characters";
import type { Campaign } from "@/types/campaigns";
import {
  useAbilityUsageMutation,
  useActiveEncounterQuery,
  useRollInitiativeMutation,
  useAdvanceTurnMutation,
  useCreateEncounterMutation,
  useCreateParticipantMutation,
  useEncounterRealtimeSync,
  useRemoveParticipantMutation,
  useUpdateEncounterMutation,
  useUpdateParticipantMutation,
} from "@/queries/encounters";
import {
  applyDamage,
  applyHealing,
  applyTempHp,
  incrementDeathSave,
  toggleConditionInList,
} from "@/utils/encounterParticipant";
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
  const { mutate: mutateParticipant } = useUpdateParticipantMutation(sessionId);
  const { mutate: mutateAbilityUsage } = useAbilityUsageMutation(sessionId);
  const { mutate: mutateRollInitiative } = useRollInitiativeMutation(sessionId);
  const { mutate: mutateAdvanceTurn } = useAdvanceTurnMutation(sessionId);
  const { mutate: mutateCreateParticipant } = useCreateParticipantMutation(sessionId);
  const { mutate: mutateRemoveParticipant } = useRemoveParticipantMutation(sessionId);
  const { mutate: mutateCreateEncounter } = useCreateEncounterMutation(sessionId);
  const { mutate: mutateUpdateEncounter } = useUpdateEncounterMutation(sessionId);

  useEffect(() => {
    setActiveCampaign(campaign.id);
  }, [campaign.id, setActiveCampaign]);

  const presence = useMemo(
    () => presenceFromUserIds(campaign, connectedUserIds),
    [campaign, connectedUserIds],
  );

  const startSession = useCallback(() => {
    getSocket().emit("session:start", { campaignId: campaign.id }, (response) => {
      if (!response.ok) {
        console.error(`session:start failed: ${response.errorCode}`);
      }
    });
  }, [campaign.id]);

  const endSession = useCallback(() => {
    if (!sessionId) return;
    getSocket().emit(
      "session:end",
      { campaignId: campaign.id, sessionId },
      (response) => {
        if (!response.ok) {
          console.error(`session:end failed: ${response.errorCode}`);
        }
      },
    );
  }, [campaign.id, sessionId]);

  const startEncounter = useCallback(() => {
    if (!sessionId) return;
    mutateCreateEncounter({});
  }, [sessionId, mutateCreateEncounter]);

  const endEncounter = useCallback(() => {
    if (!encounter) return;
    mutateUpdateEncounter({ encounterId: encounter.id, payload: { status: "ended" } });
  }, [encounter, mutateUpdateEncounter]);

  const beginCombat = useCallback(() => {
    if (!encounter) return;
    mutateUpdateEncounter({ encounterId: encounter.id, payload: { status: "active" } });
  }, [encounter, mutateUpdateEncounter]);

  const advanceTurn = useCallback(() => {
    if (!encounter) return;
    mutateAdvanceTurn(encounter.id);
  }, [encounter, mutateAdvanceTurn]);

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

  const logRoll = useCallback(
    (roll: SessionRollInput) => {
      getSocket().emit("roll:log", { campaignId: campaign.id, ...roll });
    },
    [campaign.id],
  );

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

      startSession,
      endSession,
      startEncounter,
      beginCombat,
      endEncounter,
      advanceTurn,
      adjustHp,
      grantTempHp,
      toggleCondition,
      setVisibility,
      setAcHidden,
      setShield,
      recordDeathSave,
      resetDeathSaves,
      updateParticipant,
      applyAbilityUsage,
      rollInitiative,
      addParticipant,
      removeParticipant,
      logRoll,
    }),
    [
      session,
      presence,
      events,
      rolls,
      encounter,
      participants,
      presenceFor,
      isOwnParticipant,
      activeParticipant,
      connectedCount,
      startSession,
      endSession,
      startEncounter,
      beginCombat,
      endEncounter,
      advanceTurn,
      adjustHp,
      grantTempHp,
      toggleCondition,
      setVisibility,
      setAcHidden,
      setShield,
      recordDeathSave,
      resetDeathSaves,
      updateParticipant,
      applyAbilityUsage,
      rollInitiative,
      addParticipant,
      removeParticipant,
      logRoll,
    ],
  );

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  );
};
