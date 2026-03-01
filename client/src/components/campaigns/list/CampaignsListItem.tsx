import type { Campaign } from "../../../types/campaigns";

function CampaignsListItem({ campaign }: { campaign: Campaign }) {
  return (
    <li className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-amber-600/50 transition-colors duration-200 cursor-pointer w-full">
      <h3 className="text-lg font-semibold text-amber-300">{campaign.name}</h3>
      <p className="text-sm text-gray-400 mt-1">DM: {campaign.dm.displayName}</p>
      {campaign.description && <p className="text-sm text-gray-300 mt-2">{campaign.description}</p>}
      {campaign.setting && <p className="text-xs text-gray-500 mt-1">Setting: {campaign.setting}</p>}
    </li>
  );
}

export default CampaignsListItem;
