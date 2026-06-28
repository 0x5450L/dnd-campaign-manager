import { useNavigate } from "react-router-dom";
import { useMeQuery } from "../../../queries/auth";
import type { Campaign } from "../../../types/campaigns";

function CampaignsListItem({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();
  const { data: user } = useMeQuery();

  const myMembership = campaign.members.find((m) => m.userId === user?.id);
  const myRole = myMembership?.role;
  const isDM = myRole === "dm";

  return (
    <li
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className={`bg-surface/50 p-4 rounded-xl border transition-colors duration-200 cursor-pointer w-full ${
        isDM
          ? "border-gold-dim/40 hover:border-gold/60"
          : "border-rule hover:border-frost/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gold-bright">{campaign.name}</h3>
        <div className="flex items-center gap-2">
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
