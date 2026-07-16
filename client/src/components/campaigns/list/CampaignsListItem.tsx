import { useNavigate } from "react-router-dom";
import { useMeQuery } from "@/queries/auth";
import { useNotificationStore } from "@/state/notifications/notificationStore";
import type { Campaign } from "@/types/campaigns";

type Props = {
  campaign: Campaign;
  isLive: boolean;
  isLocked: boolean;
};

function CampaignsListItem({ campaign, isLive, isLocked }: Props) {
  const navigate = useNavigate();
  const { data: user } = useMeQuery();
  const notify = useNotificationStore((s) => s.notify);

  const myMembership = campaign.members.find((m) => m.userId === user?.id);
  const myRole = myMembership?.role;
  const isDM = myRole === "dm";

  const handleClick = () => {
    if (isLocked) {
      notify("End the live session before entering another campaign", "info");
      return;
    }
    navigate(`/campaigns/${campaign.id}`);
  };

  const borderClasses = isLive
    ? "border-leaf/60 hover:border-leaf"
    : isDM
      ? "border-gold-dim/40 hover:border-gold/60"
      : "border-rule hover:border-frost/50";

  return (
    <li
      onClick={handleClick}
      className={`bg-surface/50 p-4 rounded-xl border transition-colors duration-200 w-full ${borderClasses} ${
        isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gold-bright">{campaign.name}</h3>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-leaf/20 text-leaf">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf animate-pulse" />
              Live session
            </span>
          )}
          {myRole && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isDM
                  ? "bg-gold-dim/20 text-gold-bright"
                  : "bg-frost/20 text-frost-soft"
              }`}
            >
              {myRole}
            </span>
          )}
          <span className="text-xs text-faint">{campaign.members.length} members</span>
        </div>
      </div>
      <p className="text-sm text-dim mt-1">DM: {campaign.dm.displayName}</p>
      {campaign.description && <p className="text-sm text-dim mt-2">{campaign.description}</p>}
      {campaign.setting && <p className="text-xs text-faint mt-1">Setting: {campaign.setting}</p>}
    </li>
  );
}

export default CampaignsListItem;
