import { useCallback, useMemo } from "react";
import { getSocket } from "@/services/socket";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useNotificationStore } from "@/state/notifications/notificationStore";
import type { SessionRollInput } from "@/state/liveSession/liveSessionReducer";
import type { SessionAckResponse } from "@shared/dto/socketEvents";

export const useSessionCommands = () => {
  const campaignId = useLiveSessionStore((s) => s.activeCampaignId);
  const sessionId = useLiveSessionStore((s) => s.session?.id);
  const dispatch = useLiveSessionStore((s) => s.dispatch);
  const notify = useNotificationStore((s) => s.notify);

  const notifyConflict = useCallback(
    (response: Extract<SessionAckResponse, { ok: false }>) => {
      if (response.errorCode === "session_conflict") {
        notify(
          response.conflict
            ? `You are already in a live session in "${response.conflict.campaignName}"`
            : "You are already in another live session",
          "error",
        );
        return;
      }
      notify("Session action failed", "error");
    },
    [notify],
  );

  const startSession = useCallback(() => {
    if (!campaignId) return;
    getSocket().emit("session:start", { campaignId }, (response) => {
      if (!response.ok) {
        console.error(`session:start failed: ${response.errorCode}`);
        notifyConflict(response);
        return;
      }
      dispatch({ type: "SESSION_JOINED" });
    });
  }, [campaignId, dispatch, notifyConflict]);

  const endSession = useCallback(() => {
    if (!campaignId || !sessionId) return;
    getSocket().emit("session:end", { campaignId, sessionId }, (response) => {
      if (!response.ok) {
        console.error(`session:end failed: ${response.errorCode}`);
      }
    });
  }, [campaignId, sessionId]);

  const joinSession = useCallback(() => {
    if (!campaignId || !sessionId) return;
    getSocket().emit("session:join", { campaignId, sessionId }, (response) => {
      if (!response.ok) {
        console.error(`session:join failed: ${response.errorCode}`);
        notifyConflict(response);
        return;
      }
      dispatch({ type: "SESSION_JOINED" });
    });
  }, [campaignId, sessionId, dispatch, notifyConflict]);

  const leaveSession = useCallback(() => {
    if (!campaignId || !sessionId) return;
    getSocket().emit("session:leave", { campaignId, sessionId }, (response) => {
      if (!response.ok) {
        console.error(`session:leave failed: ${response.errorCode}`);
        return;
      }
      dispatch({ type: "SESSION_LEFT" });
    });
  }, [campaignId, sessionId, dispatch]);

  const logRoll = useCallback(
    (roll: SessionRollInput) => {
      if (!campaignId) return;
      getSocket().emit("roll:log", { campaignId, ...roll });
    },
    [campaignId],
  );

  return useMemo(
    () => ({ startSession, endSession, joinSession, leaveSession, logRoll }),
    [startSession, endSession, joinSession, leaveSession, logRoll],
  );
};
