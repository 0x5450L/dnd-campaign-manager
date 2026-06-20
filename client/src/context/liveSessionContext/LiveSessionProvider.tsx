import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LiveSessionContext, type LiveSessionContextType } from "./LiveSessionContext";
import { getSocket } from "../../services/socket";
import {
  initialLiveSessionState,
  liveSessionReducer,
  type SessionRollInput,
} from "../../state/liveSession/liveSessionReducer";
import type { MemberPresence, PresenceStatus } from "../../types/session";
import type {
  CreateParticipantPayload,
  EncounterParticipantDTO,
  UpdateParticipantPayload,
} from "../../types/encounter";
import { useAuth } from "../../hooks/useAuth";
import { useCampaignCharactersQuery } from "../../queries/characters";
import type { Campaign } from "../../types/campaigns";
import {
  encounterKeys,
  useActiveEncounterQuery,
  useAdvanceTurnMutation,
  useCreateParticipantMutation,
  useEncounterRealtimeSync,
  useRemoveParticipantMutation,
  useUpdateParticipantMutation,
} from "../../queries/encounters";
import { createEncounter, updateEncounter } from "../../services/api/encounters";
import {
  applyDamage,
  applyHealing,
  applyTempHp,
  incrementDeathSave,
  toggleConditionInList,
} from "../../utils/encounterParticipant";
import type {
  PresenceChangedPayload,
  RollLoggedPayload,
  SessionEndedPayload,
  SessionStartedPayload,
} from "../../../../shared/socketEvents";

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
  const [state, dispatch] = useReducer(liveSessionReducer, initialLiveSessionState);
  const queryClient = useQueryClient();

  const sessionId = state.session?.id;
  const encounterQuery = useActiveEncounterQuery(sessionId);
  const encounter = encounterQuery.data ?? null;
  const participants = useMemo(() => encounter?.participants ?? [], [encounter]);

  const { user } = useAuth();
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
  const { mutate: mutateAdvanceTurn } = useAdvanceTurnMutation(sessionId);
  const { mutate: mutateCreateParticipant } = useCreateParticipantMutation(sessionId);
  const { mutate: mutateRemoveParticipant } = useRemoveParticipantMutation(sessionId);

  const campaignRef = useRef(campaign);
  useEffect(() => {
    campaignRef.current = campaign;
  }, [campaign]);

  useEffect(() => {
    const socket = getSocket();

    const join = () => {
      socket.emit("campaign:join", campaign.id, (response) => {
        if (!response.ok) {
          console.error(`campaign:join failed: ${response.errorCode}`);
          return;
        }
        if (response.activeSession) {
          dispatch({ type: "HYDRATE_SESSION", session: response.activeSession });
        }
      });
    };

    join();
    socket.on("connect", join);

    const handleRollLogged = (payload: RollLoggedPayload) => {
      if (payload.campaignId !== campaign.id) return;
      dispatch({ type: "ROLL_LOGGED", roll: payload.roll });
    };

    const handleSessionStarted = (payload: SessionStartedPayload) => {
      if (payload.campaignId !== campaign.id) return;
      dispatch({ type: "START_SESSION", session: payload.session });
    };

    const handleSessionEnded = (payload: SessionEndedPayload) => {
      if (payload.campaignId !== campaign.id) return;
      dispatch({ type: "END_SESSION" });
    };

    const handlePresenceChanged = (payload: PresenceChangedPayload) => {
      if (payload.campaignId !== campaign.id) return;
      dispatch({
        type: "REPLACE_PRESENCE",
        presence: presenceFromUserIds(campaignRef.current, payload.userIds),
      });
    };

    socket.on("roll_logged", handleRollLogged);
    socket.on("session_started", handleSessionStarted);
    socket.on("session_ended", handleSessionEnded);
    socket.on("presence_changed", handlePresenceChanged);

    return () => {
      socket.off("connect", join);
      socket.off("roll_logged", handleRollLogged);
      socket.off("session_started", handleSessionStarted);
      socket.off("session_ended", handleSessionEnded);
      socket.off("presence_changed", handlePresenceChanged);
      socket.emit("campaign:leave", campaign.id);
    };
  }, [campaign.id]);

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

  const startEncounter = useCallback(async () => {
    if (!sessionId) return;
    await createEncounter(sessionId, {});
    queryClient.invalidateQueries({ queryKey: encounterKeys.list(sessionId) });
  }, [sessionId, queryClient]);

  const endEncounter = useCallback(async () => {
    if (!encounter || !sessionId) return;
    await updateEncounter(encounter.id, { status: "ended" });
    queryClient.invalidateQueries({ queryKey: encounterKeys.list(sessionId) });
  }, [encounter, sessionId, queryClient]);

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
      state.presence.find((p) => p.userId === userId)?.status ?? "offline",
    [state.presence],
  );

  const activeParticipant = useMemo(() => {
    if (!encounter || participants.length === 0) return null;
    return participants[encounter.currentTurnIndex] ?? null;
  }, [encounter, participants]);

  const connectedCount = useMemo(
    () => state.presence.filter((p) => p.status === "connected").length,
    [state.presence],
  );

  const value = useMemo<LiveSessionContextType>(
    () => ({
      session: state.session,
      encounter,
      participants,
      presence: state.presence,
      events: state.events,
      rolls: state.rolls,

      presenceFor,
      isOwnParticipant,
      activeParticipant,
      connectedCount,

      startSession,
      endSession,
      startEncounter,
      endEncounter,
      advanceTurn,
      adjustHp,
      grantTempHp,
      toggleCondition,
      setVisibility,
      setAcHidden,
      recordDeathSave,
      resetDeathSaves,
      updateParticipant,
      addParticipant,
      removeParticipant,
      logRoll,
    }),
    [
      state.session,
      state.presence,
      state.events,
      state.rolls,
      encounter,
      participants,
      presenceFor,
      isOwnParticipant,
      activeParticipant,
      connectedCount,
      startSession,
      endSession,
      startEncounter,
      endEncounter,
      advanceTurn,
      adjustHp,
      grantTempHp,
      toggleCondition,
      setVisibility,
      setAcHidden,
      recordDeathSave,
      resetDeathSaves,
      updateParticipant,
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
