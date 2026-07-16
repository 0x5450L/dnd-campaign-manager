import { useEffect } from "react";
import { useDiceRollerStore } from "@/state/diceRoller/diceRollerStore";
import { useLiveSession } from "@/hooks/useLiveSession";

export const SessionDiceBridge = () => {
  const registerSessionSink = useDiceRollerStore((s) => s.registerSessionSink);
  const { session, logRoll } = useLiveSession();

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
