import { useCallback, useEffect, useMemo, useRef } from "react";
import { SSEContext } from "./SSEContext";
import { useMeQuery } from "@/queries/auth";

export const SSEProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user } = useMeQuery();
  const eventSourceRef = useRef<EventSource | null>(null);
  const listenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());

  useEffect(() => {
    const token = localStorage.getItem("dndCampaignManagerJWT");
    if (!user || !token) return;

    const eventSource = new EventSource(
      `/api/invites/stream?token=${encodeURIComponent(token)}`,
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callbacks = listenersRef.current.get(data.type);
      if (callbacks) {
        callbacks.forEach((cb) => cb(data));
      }
    };

    return () => eventSource.close();
  }, [user]);

  const subscribe = useCallback((eventType: string, callback: (data: unknown) => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(callback);

    return () => {
      listenersRef.current.get(eventType)?.delete(callback);
    };
  }, []);

  const value = useMemo(() => ({ subscribe }), [subscribe]);

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
};
