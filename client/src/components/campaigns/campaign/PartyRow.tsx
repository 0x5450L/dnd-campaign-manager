import type { Campaign } from "../../../types/campaigns";
import type { PresenceStatus } from "../../../types/session";
import { useLiveSession } from "../../../context/liveSessionContext/useLiveSession";

type PartyRowProps = {
  members: Campaign["members"];
  dmId: string;
  isDM: boolean;
};

const dotForStatus = (status: PresenceStatus) => {
  if (status === "connected") return "bg-leaf shadow-[0_0_6px_rgba(93,165,93,0.7)]";
  if (status === "away") return "bg-gold-dim";
  return "bg-faint/60";
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const PartyRow = ({ members, dmId, isDM }: PartyRowProps) => {
  const { session, presenceFor, togglePresence } = useLiveSession();
  const sessionActive = !!session;

  return (
    <div className="cs-section-card flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <span className="font-fantasy text-base font-bold uppercase tracking-[0.16em] text-gold-bright">
          Party
        </span>
        <span className="font-fantasy text-xs uppercase tracking-[0.14em] text-faint">
          {sessionActive
            ? `${members.filter((m) => presenceFor(m.userId) === "connected").length} / ${members.length} in session`
            : `${members.length} members`}
        </span>
      </div>

      <ul className="flex flex-wrap gap-1.5">
        {members.map((member) => {
          const status = sessionActive ? presenceFor(member.userId) : "offline";
          const isMemberDM = member.userId === dmId;
          return (
            <li
              key={member.id}
              className="inline-flex items-center gap-2 rounded-md border border-rule bg-surface/40 px-2 py-1 transition-colors hover:border-hover/60"
            >
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-rule bg-bg/70 font-fantasy text-xs text-gold">
                {initialsOf(member.user.displayName)}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface ${dotForStatus(status)}`}
                />
              </div>

              <span className="font-fantasy text-sm text-ink">
                {member.user.displayName}
              </span>
              <span
                className={`shrink-0 rounded border px-1 py-0.5 font-fantasy text-[9px] uppercase tracking-widest ${
                  isMemberDM
                    ? "border-gold-dim/60 text-gold-bright"
                    : "border-rule text-dim"
                }`}
              >
                {isMemberDM ? "DM" : "Player"}
              </span>

              {isDM && sessionActive && !isMemberDM && (
                <button
                  type="button"
                  onClick={() => togglePresence(member.userId)}
                  className="cs-btn-ghost shrink-0 !py-0.5 text-[10px]"
                  title="Toggle mock presence (debug)"
                >
                  {status === "connected" ? "Kick" : "Sim"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PartyRow;
