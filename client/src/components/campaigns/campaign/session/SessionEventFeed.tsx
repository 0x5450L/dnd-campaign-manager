import { useLiveSession } from "../../../../context/liveSessionContext/useLiveSession";
import type { SessionEventKind } from "../../../../types/session";

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const kindAccent: Record<SessionEventKind, string> = {
  session_started: "bg-leaf",
  session_ended: "bg-rust",
  member_joined: "bg-leaf",
  member_left: "bg-faint/60",
  encounter_started: "bg-gold",
  encounter_ended: "bg-gold-dim",
  turn_advanced: "bg-gold-bright",
  hp_changed: "bg-rust",
  condition_added: "bg-gold-dim",
  condition_removed: "bg-faint/60",
  dice_rolled: "bg-gold",
  note: "bg-rule",
};

export const SessionEventFeed = () => {
  const { events } = useLiveSession();

  return (
    <div className="cs-section-card flex h-full min-h-[280px] flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <span className="cs-section-title !p-0 !text-left">Session log</span>
        <span className="text-[10px] uppercase tracking-[0.12em] text-faint">
          {events.length} events
        </span>
      </div>
      <ul className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {events.length === 0 && (
          <li className="px-2 py-3 text-center text-xs text-faint">
            Nothing has happened yet.
          </li>
        )}
        {events.map((e) => (
          <li
            key={e.id}
            className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm text-ink/90 transition-colors hover:bg-surface-light/30"
          >
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${kindAccent[e.kind]}`} />
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
              <span className="truncate">{e.message}</span>
              <span className="shrink-0 font-fantasy text-[10px] uppercase tracking-widest text-faint">
                {formatTime(e.at)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionEventFeed;
