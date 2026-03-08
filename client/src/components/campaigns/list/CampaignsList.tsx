import CampaignsListItem from "./CampaignsListItem";
import { useCampaigns } from "../../../hooks/useCampaigns";
import type { Campaign } from "../../../types/campaigns";

function CampaignsList() {
  const { campaigns, message, isLoading } = useCampaigns();

  if (isLoading) {
    return <p className="text-amber-400">Loading campaigns...</p>;
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">{message}</p>

      <ul className="flex flex-col gap-3">
        {campaigns &&
          campaigns.map((campaign: Campaign) => <CampaignsListItem key={campaign.id} campaign={campaign} />)}
      </ul>
    </div>
  );
}

export default CampaignsList;
