import CampaignsListItem from "./CampaignsListItem";
import { useCampaignsQuery } from "@/queries/campaigns";
import type { Campaign } from "@/types/campaigns";

function CampaignsList() {
  const { data: campaigns, isLoading, isError, error } = useCampaignsQuery();

  if (isLoading) {
    return <p className="text-gold">Loading campaigns...</p>;
  }

  if (isError) {
    return <p className="text-rust">{(error as Error).message}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {campaigns?.map((campaign: Campaign) => (
        <CampaignsListItem key={campaign.id} campaign={campaign} />
      ))}
    </ul>
  );
}

export default CampaignsList;
