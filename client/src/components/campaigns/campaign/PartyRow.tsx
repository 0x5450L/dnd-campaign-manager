import { useState } from "react";
import type { Campaign } from "../../../types/campaigns";
import type { PresenceStatus } from "../../../types/session";
import { useLiveSession } from "../../../context/liveSessionContext/useLiveSession";
import { useRemoveMemberMutation } from "../../../queries/members";
import { useNotificationStore } from "../../../state/notifications/notificationStore";
import ConfirmDialog from "../../ui/ConfirmDialog";

type Member = Campaign["members"][number];

type PartyRowProps = {
  members: Campaign["members"];
  dmId: string;
  isDM: boolean;
  campaignId: string;
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

export const PartyRow = ({ members, dmId, isDM, campaignId }: PartyRowProps) => {
  const { session, presenceFor } = useLiveSession();
  const sessionActive = !!session;
  const removeMember = useRemoveMemberMutation();
  const notify = useNotificationStore((s) => s.notify);
  const [memberToKick, setMemberToKick] = useState<Member | null>(null);

  const handleConfirmKick = () => {
    if (!memberToKick) return;
    const target = memberToKick;
    setMemberToKick(null);
    removeMember.mutate(
      { campaignId, userId: target.userId },
      {
        onSuccess: () => notify(`${target.user.displayName} was removed from the party`, "success"),
        onError: (err) => notify((err as Error).message, "error"),
      },
    );
  };

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
          const canKick = isDM && !isMemberDM;
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

              {canKick && (
                <button
                  type="button"
                  onClick={() => setMemberToKick(member)}
                  aria-label={`Remove ${member.user.displayName} from the campaign`}
                  title="Remove from campaign"
                  className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-transparent text-faint transition-colors duration-150 hover:border-rust/50 hover:bg-rust/15 hover:text-rust focus-visible:border-rust/50 focus-visible:text-rust focus-visible:outline-none"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {memberToKick && (
        <ConfirmDialog
          title="Remove member"
          message={`Remove "${memberToKick.user.displayName}" from the campaign? Their characters will stay in the campaign.`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          onConfirm={handleConfirmKick}
          onCancel={() => setMemberToKick(null)}
        />
      )}
    </div>
  );
};

export default PartyRow;
