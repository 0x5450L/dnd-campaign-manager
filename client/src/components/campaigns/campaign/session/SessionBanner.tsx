import { useEffect, useState } from "react";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useActiveEncounter } from "@/hooks/liveSession/useActiveEncounter";
import { usePresence } from "@/hooks/liveSession/usePresence";
import { useSessionCommands } from "@/hooks/liveSession/useSessionCommands";

type SessionBannerProps = {
  isDM: boolean;
};

const formatElapsed = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
};

export const SessionBanner = ({ isDM }: SessionBannerProps) => {
  const session = useLiveSessionStore((s) => s.session);
  const { encounter } = useActiveEncounter();
  const { connectedCount } = usePresence();
  const { endSession, leaveSession } = useSessionCommands();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [session]);

  if (!session) return null;

  const startedMs = new Date(session.startedAt).getTime();
  const elapsed = formatElapsed(now - startedMs);

  return (
    <div className="cs-section-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-leaf" />
        </span>
        <div className="flex flex-col">
          <span className="font-fantasy text-lg font-bold uppercase tracking-[0.18em] text-gold-bright">
            Session #{session.number} live
          </span>
          <span className="text-xs text-dim">
            {session.title ?? "Untitled session"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.12em] text-faint">
        <Metric label="Elapsed" value={elapsed} />
        <Metric label="Connected" value={`${connectedCount}`} />
        <Metric
          label="Round"
          value={encounter ? `${encounter.round}` : "—"}
        />
        {isDM ? (
          <button
            type="button"
            onClick={endSession}
            className="cs-btn-ghost border-rust/70 text-rust hover:!border-rust hover:!text-rust hover:!bg-rust/10"
          >
            End session
          </button>
        ) : (
          <button
            type="button"
            onClick={leaveSession}
            className="cs-btn-ghost border-rust/70 text-rust hover:!border-rust hover:!text-rust hover:!bg-rust/10"
          >
            Leave session
          </button>
        )}
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center leading-tight">
    <span className="font-fantasy text-lg text-ink">{value}</span>
    <span className="text-[10px] text-faint">{label}</span>
  </div>
);

export default SessionBanner;
