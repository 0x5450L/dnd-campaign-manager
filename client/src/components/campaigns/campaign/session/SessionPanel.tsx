import { useLiveSession } from "../../../../context/liveSessionContext/useLiveSession";
import SessionBanner from "./SessionBanner";
import StartSessionCTA from "./StartSessionCTA";
import EncounterTracker from "./EncounterTracker";
import SessionEventFeed from "./SessionEventFeed";

type SessionPanelProps = {
  isDM: boolean;
};

export const SessionPanel = ({ isDM }: SessionPanelProps) => {
  const { session } = useLiveSession();

  if (!session) {
    return <StartSessionCTA isDM={isDM} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <SessionBanner isDM={isDM} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <EncounterTracker isDM={isDM} />
        <SessionEventFeed />
      </div>
    </div>
  );
};

export default SessionPanel;
