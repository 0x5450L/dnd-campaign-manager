import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import SessionBanner from "./SessionBanner";
import StartSessionCTA from "./StartSessionCTA";
import EncounterTracker from "./EncounterTracker";
import SessionEventFeed from "./SessionEventFeed";
import SessionRollFeed from "./SessionRollFeed";
import SessionDiceBridge from "./SessionDiceBridge";

type SessionPanelProps = {
  isDM: boolean;
};

export const SessionPanel = ({ isDM }: SessionPanelProps) => {
  const session = useLiveSessionStore((s) => s.session);

  return (
    <>
      <SessionDiceBridge />
      {!session ? (
        <StartSessionCTA isDM={isDM} />
      ) : (
        <div className="flex flex-col gap-4">
          <SessionBanner isDM={isDM} />

          <EncounterTracker isDM={isDM} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SessionRollFeed />
            <SessionEventFeed />
          </div>
        </div>
      )}
    </>
  );
};

export default SessionPanel;
