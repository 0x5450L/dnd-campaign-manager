import { useCallback, useMemo } from "react";
import { getSocket } from "@/services/socket";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import type { SessionRollInput } from "@/state/liveSession/liveSessionReducer";

export const useSessionCommands = () => {
  const campaignId = useLiveSessionStore((s) => s.activeCampaignId);
  const sessionId = useLiveSessionStore((s) => s.session?.id);

  const startSession = useCallback(() => {
    if (!campaignId) return;
    getSocket().emit("session:start", { campaignId }, (response) => {
      if (!response.ok) {
        console.error(`session:start failed: ${response.errorCode}`);
      }
    });
  }, [campaignId]);

  const endSession = useCallback(() => {
    if (!campaignId || !sessionId) return;
    getSocket().emit("session:end", { campaignId, sessionId }, (response) => {
      if (!response.ok) {
        console.error(`session:end failed: ${response.errorCode}`);
      }
    });
  }, [campaignId, sessionId]);

  const logRoll = useCallback(
    (roll: SessionRollInput) => {
      if (!campaignId) return;
      getSocket().emit("roll:log", { campaignId, ...roll });
    },
    [campaignId],
  );

  return useMemo(
    () => ({ startSession, endSession, logRoll }),
    [startSession, endSession, logRoll],
  );
};
