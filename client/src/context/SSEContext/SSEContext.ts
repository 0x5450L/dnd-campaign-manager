import { createContext } from "react";

type SSEContextType = {
  subscribe: (eventType: string, callback: (data: unknown) => void) => () => void;
};

export const SSEContext = createContext<SSEContextType | null>(null);