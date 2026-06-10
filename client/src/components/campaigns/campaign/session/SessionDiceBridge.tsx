import { useEffect } from "react";
import { useDiceRoller } from "../../../../context/diceRollerContext/useDiceRoller";
import { useLiveSession } from "../../../../context/liveSessionContext/useLiveSession";
import { useAuth } from "../../../../hooks/useAuth";

export const SessionDiceBridge = () => {
  const { registerSessionSink } = useDiceRoller();
  const { session, logRoll } = useLiveSession();
  const { user } = useAuth();

  const sessionIsActive = session?.status === "active";
  const actorName = user?.displayName ?? "Unknown adventurer";

  useEffect(() => {
    if (!sessionIsActive) return;
    registerSessionSink((result) => {
      logRoll({
        actorName,
        expression: result.expression,
        total: result.total,
        critSuccess: result.critSuccess,
        critFail: result.critFail,
      });
    });
    return () => registerSessionSink(null);
  }, [sessionIsActive, actorName, registerSessionSink, logRoll]);

  return null;
};

export default SessionDiceBridge;
