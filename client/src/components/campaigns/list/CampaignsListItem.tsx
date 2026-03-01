import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import type { Campaign } from "../../../types/campaigns";

function CampaignsListItem({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const myMembership = campaign.members.find((m) => m.userId === user?.id);
  const myRole = myMembership?.role;
  const isDM = myRole === "DM";

  return (
    <li
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
      className={`bg-gray-800/50 p-4 rounded-xl border transition-colors duration-200 cursor-pointer w-full ${
        isDM
          ? "border-amber-700/40 hover:border-amber-500/60"
          : "border-gray-700 hover:border-blue-500/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-300">{campaign.name}</h3>
        <div className="flex items-center gap-2">
          {myRole && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                isDM
                  ? "bg-amber-600/20 text-amber-300"
                  : "bg-blue-600/20 text-blue-300"
              }`}
            >
              {myRole}
            </span>
          )}
          <span className="text-xs text-gray-500">{campaign.members.length} members</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-1">DM: {campaign.dm.displayName}</p>
      {campaign.description && <p className="text-sm text-gray-300 mt-2">{campaign.description}</p>}
      {campaign.setting && <p className="text-xs text-gray-500 mt-1">Setting: {campaign.setting}</p>}
    </li>
  );
}

export default CampaignsListItem;
