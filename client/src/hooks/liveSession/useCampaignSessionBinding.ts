import { useEffect } from "react";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useEncounterRealtimeSync } from "@/queries/encounters";

export const useCampaignSessionBinding = (campaignId: string | undefined) => {
  const setActiveCampaign = useLiveSessionStore((s) => s.setActiveCampaign);
  const sessionId = useLiveSessionStore((s) => s.session?.id);

  useEffect(() => {
    if (campaignId) setActiveCampaign(campaignId);
  }, [campaignId, setActiveCampaign]);

  useEncounterRealtimeSync(campaignId, sessionId);
};
