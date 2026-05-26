import { useContext } from "react";
import { LiveSessionContext } from "./LiveSessionContext";

export const useLiveSession = () => {
  const ctx = useContext(LiveSessionContext);
  if (!ctx) {
    throw new Error("useLiveSession must be used inside <LiveSessionProvider>");
  }
  return ctx;
};
