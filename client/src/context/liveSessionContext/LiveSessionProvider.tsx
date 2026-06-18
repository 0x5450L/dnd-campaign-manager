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
  type ParticipantPatch,
  type SessionRollInput,
} from "../../state/liveSession/liveSessionReducer";
import type { MemberPresence, PresenceStatus } from "../../types/session";
import type { Campaign } from "../../types/campaigns";
import { encounterKeys, useActiveEncounterQuery } from "../../queries/encounters";
import { createEncounter, updateEncounter } from "../../services/api/encounters";
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
    dispatch({ type: "ADVANCE_TURN" });
  }, []);

  const adjustHp = useCallback((participantId: string, delta: number) => {
    dispatch({ type: "ADJUST_HP", participantId, delta });
  }, []);

  const grantTempHp = useCallback((participantId: string, amount: number) => {
    dispatch({ type: "GRANT_TEMP_HP", participantId, amount });
  }, []);

  const toggleCondition = useCallback(
    (participantId: string, condition: string) => {
      dispatch({ type: "TOGGLE_CONDITION", participantId, condition });
    },
    [],
  );

  const setVisibility = useCallback(
    (participantId: string, isVisible: boolean) => {
      dispatch({ type: "SET_VISIBILITY", participantId, isVisible });
    },
    [],
  );

  const setAcHidden = useCallback(
    (participantId: string, acHidden: boolean) => {
      dispatch({ type: "SET_AC_HIDDEN", participantId, acHidden });
    },
    [],
  );

  const recordDeathSave = useCallback(
    (participantId: string, outcome: "success" | "failure") => {
      dispatch({ type: "RECORD_DEATH_SAVE", participantId, outcome });
    },
    [],
  );

  const resetDeathSaves = useCallback((participantId: string) => {
    dispatch({ type: "RESET_DEATH_SAVES", participantId });
  }, []);

  const updateParticipant = useCallback(
    (participantId: string, patch: ParticipantPatch) => {
      dispatch({ type: "UPDATE_PARTICIPANT", participantId, patch });
    },
    [],
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
      logRoll,
    ],
  );

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  );
};
