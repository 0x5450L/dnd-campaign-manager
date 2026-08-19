import { useCallback, useMemo } from "react";
import { getSocket } from "@/services/socket";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useNotificationStore } from "@/state/notifications/notificationStore";
import type { SessionRollInput } from "@/state/liveSession/liveSessionReducer";
import type {
  SessionAckErrorCode,
  SessionAckResponse,
} from "@dnd/shared/dto/socketEvents";

export const useSessionCommands = () => {
  const campaignId = useLiveSessionStore((s) => s.activeCampaignId);
  const sessionId = useLiveSessionStore((s) => s.session?.id);
  const dispatch = useLiveSessionStore((s) => s.dispatch);
  const notify = useNotificationStore((s) => s.notify);

  const notifyFailure = useCallback(
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

      const messages: Record<Exclude<SessionAckErrorCode, "session_conflict">, string> = {
        unauthenticated: "Your session expired. Sign in again to continue.",
        no_access: "You are no longer a member of this campaign.",
        not_dm: "Only the Dungeon Master can start or end a session.",
        internal: "The server could not complete that. Try again in a moment.",
      };

      notify(messages[response.errorCode] ?? "Session action failed", "error");
    },
    [notify],
  );

  const startSession = useCallback(() => {
    if (!campaignId) return;
    getSocket().emit("session:start", { campaignId }, (response) => {
      if (!response.ok) {
        notifyFailure(response);
        return;
      }
      dispatch({ type: "SESSION_JOINED" });
    });
  }, [campaignId, dispatch, notifyFailure]);

  const endSession = useCallback(() => {
    if (!campaignId || !sessionId) return;
    getSocket().emit("session:end", { campaignId, sessionId }, (response) => {
      if (!response.ok) {
        notifyFailure(response);
      }
    });
  }, [campaignId, sessionId, notifyFailure]);

  const joinSession = useCallback(() => {
    if (!campaignId || !sessionId) return;
    getSocket().emit("session:join", { campaignId, sessionId }, (response) => {
      if (!response.ok) {
        notifyFailure(response);
        return;
      }
      dispatch({ type: "SESSION_JOINED" });
    });
  }, [campaignId, sessionId, dispatch, notifyFailure]);

  const leaveSession = useCallback(() => {
    if (!campaignId || !sessionId) return;
    getSocket().emit("session:leave", { campaignId, sessionId }, (response) => {
      if (!response.ok) {
        notifyFailure(response);
        return;
      }
      dispatch({ type: "SESSION_LEFT" });
    });
  }, [campaignId, sessionId, dispatch, notifyFailure]);

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
