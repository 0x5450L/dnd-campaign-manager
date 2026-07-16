import { useEffect } from "react";
import { useDiceRollerStore } from "@/state/diceRoller/diceRollerStore";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useSessionCommands } from "@/hooks/liveSession/useSessionCommands";

export const SessionDiceBridge = () => {
  const registerSessionSink = useDiceRollerStore((s) => s.registerSessionSink);
  const session = useLiveSessionStore((s) => s.session);
  const { logRoll } = useSessionCommands();

  const sessionIsActive = session?.status === "active";

  useEffect(() => {
    if (!sessionIsActive) return;
    registerSessionSink((result) => {
      logRoll({
        expression: result.expression,
        total: result.total,
        critSuccess: result.critSuccess,
        critFail: result.critFail,
      });
    });
    return () => registerSessionSink(null);
  }, [sessionIsActive, registerSessionSink, logRoll]);

  return null;
};

export default SessionDiceBridge;
