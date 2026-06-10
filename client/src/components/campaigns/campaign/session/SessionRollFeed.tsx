import { useLiveSession } from "../../../../context/liveSessionContext/useLiveSession";
import type { SessionDiceRoll } from "../../../../types/session";

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const totalBadgeClass = (roll: SessionDiceRoll) => {
  if (roll.critSuccess) return "border-leaf bg-leaf/20 text-leaf-soft";
  if (roll.critFail) return "border-rust bg-rust/20 text-rust-soft";
  return "border-rule bg-bg/60 text-gold-bright";
};

export const SessionRollFeed = () => {
  const { rolls } = useLiveSession();

  return (
    <div className="cs-section-card flex h-[220px] flex-col gap-1.5 p-3">
      <div className="flex items-center justify-between">
        <span className="cs-section-title !p-0 !text-left">Table rolls</span>
        <span className="text-[10px] uppercase tracking-[0.12em] text-faint">
          {rolls.length}
        </span>
      </div>
      <ul className="custom-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto pr-1">
        {rolls.length === 0 && (
          <li className="px-2 py-2 text-center text-xs italic text-faint">
            No shared rolls yet.
          </li>
        )}
        {rolls.map((roll) => (
          <li
            key={roll.id}
            className="flex items-center gap-2 rounded px-1.5 py-1 transition-colors hover:bg-surface-light/30"
          >
            <span
              className={`flex h-6 min-w-[32px] shrink-0 items-center justify-center rounded border px-1 font-fantasy text-sm font-bold ${totalBadgeClass(roll)}`}
            >
              {roll.total}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs leading-none">
              <span className="text-ink">{roll.actorName}</span>
              <span className="font-fantasy tracking-wider text-faint">
                {" "}
                · {roll.expression}
              </span>
            </span>
            <span className="shrink-0 font-fantasy text-[9px] uppercase tracking-widest text-faint">
              {formatTime(roll.at)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionRollFeed;
