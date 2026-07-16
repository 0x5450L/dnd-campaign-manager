import { useCallback } from "react";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import type { PresenceStatus } from "@/types/session";

export const usePresence = () => {
  const connectedUserIds = useLiveSessionStore((s) => s.connectedUserIds);

  const presenceFor = useCallback(
    (userId: string): PresenceStatus =>
      connectedUserIds.includes(userId) ? "connected" : "offline",
    [connectedUserIds],
  );

  return { connectedUserIds, presenceFor, connectedCount: connectedUserIds.length };
};
