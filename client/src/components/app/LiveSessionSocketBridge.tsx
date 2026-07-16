import { useEffect } from "react";
import { getSocket } from "@/services/socket";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import type {
  InitiativeUpdatedPayload,
  PresenceChangedPayload,
  RollLoggedPayload,
  SessionEndedPayload,
  SessionStartedPayload,
  TurnAdvancedPayload,
} from "@shared/dto/socketEvents";

export const LiveSessionSocketBridge = () => {
  const campaignId = useLiveSessionStore((s) => s.activeCampaignId);
  const dispatch = useLiveSessionStore((s) => s.dispatch);

  useEffect(() => {
    if (!campaignId) return;
    const socket = getSocket();

    const join = () => {
      socket.emit("campaign:join", campaignId, (response) => {
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
      if (payload.campaignId !== campaignId) return;
      dispatch({ type: "ROLL_LOGGED", roll: payload.roll });
    };

    const handleSessionStarted = (payload: SessionStartedPayload) => {
      if (payload.campaignId !== campaignId) return;
      dispatch({ type: "START_SESSION", session: payload.session });
    };

    const handleSessionEnded = (payload: SessionEndedPayload) => {
      if (payload.campaignId !== campaignId) return;
      dispatch({ type: "END_SESSION" });
    };

    const handlePresenceChanged = (payload: PresenceChangedPayload) => {
      if (payload.campaignId !== campaignId) return;
      dispatch({ type: "REPLACE_PRESENCE", userIds: payload.userIds });
    };

    const handleInitiativeRolls = (payload: InitiativeUpdatedPayload) => {
      if (payload.campaignId !== campaignId || !payload.rolls?.length) return;
      dispatch({ type: "INITIATIVE_ROLLED", rolls: payload.rolls });
    };

    const handleTurnAdvanced = (payload: TurnAdvancedPayload) => {
      if (payload.campaignId !== campaignId) return;
      dispatch({
        type: "TURN_ADVANCED",
        participantName: payload.participant?.name ?? null,
        rechargeRolls: payload.rechargeRolls,
      });
    };

    socket.on("initiative_updated", handleInitiativeRolls);
    socket.on("turn_advanced", handleTurnAdvanced);
    socket.on("roll_logged", handleRollLogged);
    socket.on("session_started", handleSessionStarted);
    socket.on("session_ended", handleSessionEnded);
    socket.on("presence_changed", handlePresenceChanged);

    return () => {
      socket.off("connect", join);
      socket.off("initiative_updated", handleInitiativeRolls);
      socket.off("turn_advanced", handleTurnAdvanced);
      socket.off("roll_logged", handleRollLogged);
      socket.off("session_started", handleSessionStarted);
      socket.off("session_ended", handleSessionEnded);
      socket.off("presence_changed", handlePresenceChanged);
      socket.emit("campaign:leave", campaignId);
    };
  }, [campaignId, dispatch]);

  return null;
};
