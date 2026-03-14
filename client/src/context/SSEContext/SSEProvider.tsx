import { useEffect, useRef } from "react";
import { SSEContext } from "./SSEContext";

export const SSEProvider = ({ children }: { children: React.ReactNode }) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const listenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());

  useEffect(() => {
    const eventSource = new EventSource("/api/invites/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callbacks = listenersRef.current.get(data.type);
      if (callbacks) {
        callbacks.forEach((cb) => cb(data));
      }
    };

    return () => eventSource.close();
  }, []);

  const subscribe = (eventType: string, callback: (data: unknown) => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(callback);

    return () => {
      listenersRef.current.get(eventType)?.delete(callback);
    };
  };

  return <SSEContext.Provider value={{ subscribe }}>{children}</SSEContext.Provider>;
};
