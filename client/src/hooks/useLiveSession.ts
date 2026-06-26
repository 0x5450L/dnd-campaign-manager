import { useContext } from "react";
import { LiveSessionContext } from "../context/liveSessionContext/LiveSessionContext";

export const useLiveSession = () => {
  const ctx = useContext(LiveSessionContext);
  if (!ctx) {
    throw new Error("useLiveSession must be used inside <LiveSessionProvider>");
  }
  return ctx;
};
