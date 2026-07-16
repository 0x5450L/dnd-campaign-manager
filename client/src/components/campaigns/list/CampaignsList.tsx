import { useMemo } from "react";
import CampaignsListItem from "./CampaignsListItem";
import { useCampaignsQuery } from "@/queries/campaigns";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useCampaignVisitsStore } from "@/state/campaigns/campaignVisitsStore";

function CampaignsList() {
  const { data: campaigns, isLoading, isError, error } = useCampaignsQuery();
  const activeCampaignId = useLiveSessionStore((s) => s.activeCampaignId);
  const hasLiveSession = useLiveSessionStore((s) => s.session !== null);
  const visitedAt = useCampaignVisitsStore((s) => s.visitedAt);

  const sortedCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return [...campaigns].sort((a, b) => {
      const aLive = hasLiveSession && a.id === activeCampaignId;
      const bLive = hasLiveSession && b.id === activeCampaignId;
      if (aLive !== bLive) return aLive ? -1 : 1;
      return (visitedAt[b.id] ?? 0) - (visitedAt[a.id] ?? 0);
    });
  }, [campaigns, hasLiveSession, activeCampaignId, visitedAt]);

  if (isLoading) {
    return <p className="text-gold">Loading campaigns...</p>;
  }

  if (isError) {
    return <p className="text-rust">{(error as Error).message}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {sortedCampaigns.map((campaign) => (
        <CampaignsListItem
          key={campaign.id}
          campaign={campaign}
          isLive={hasLiveSession && campaign.id === activeCampaignId}
          isLocked={hasLiveSession && campaign.id !== activeCampaignId}
        />
      ))}
    </ul>
  );
}

export default CampaignsList;
