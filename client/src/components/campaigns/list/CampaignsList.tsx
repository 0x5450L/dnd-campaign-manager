import { useMemo } from "react";
import CampaignsListItem from "./CampaignsListItem";
import { useCampaignsQuery } from "@/queries/campaigns";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useCampaignVisitsStore } from "@/state/campaigns/campaignVisitsStore";

function CampaignsList() {
  const { data: campaigns, isLoading, isError, error } = useCampaignsQuery();
  const activeCampaignId = useLiveSessionStore((s) => s.activeCampaignId);
  const isAttendee = useLiveSessionStore((s) => s.isAttendee);
  const visitedAt = useCampaignVisitsStore((s) => s.visitedAt);

  const sortedCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return [...campaigns].sort((a, b) => {
      const aLive = a.activeSessionId !== null;
      const bLive = b.activeSessionId !== null;
      if (aLive !== bLive) return aLive ? -1 : 1;
      return (visitedAt[b.id] ?? 0) - (visitedAt[a.id] ?? 0);
    });
  }, [campaigns, visitedAt]);

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
          isLive={campaign.activeSessionId !== null}
          isLocked={isAttendee && campaign.id !== activeCampaignId}
        />
      ))}
    </ul>
  );
}

export default CampaignsList;
