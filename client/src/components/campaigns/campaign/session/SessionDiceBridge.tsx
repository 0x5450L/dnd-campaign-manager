import { useEffect } from "react";
import { useDiceRoller } from "../../../../context/diceRollerContext/useDiceRoller";
import { useLiveSession } from "../../../../context/liveSessionContext/useLiveSession";

export const SessionDiceBridge = () => {
  const { registerSessionSink } = useDiceRoller();
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
