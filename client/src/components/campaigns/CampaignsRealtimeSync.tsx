import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSSE } from "@/hooks/useSSE";
import { campaignKeys } from "@/queries/campaigns";
import type { Campaign } from "@/types/campaigns";

export const CampaignsRealtimeSync = () => {
  const { subscribe } = useSSE();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id: viewedCampaignId } = useParams();

  useEffect(() => {
    const invalidateLists = () =>
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });

    const handleMembershipChange = (data: unknown) => {
      invalidateLists();
      const campaignId = (data as { campaignId?: string }).campaignId;
      if (campaignId) {
        queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
      }
    };

    const handleCampaignUpdated = (data: unknown) => {
      const { campaignId, campaign } = data as {
        campaignId?: string;
        campaign?: Campaign;
      };
      if (campaign && campaignId) {
        queryClient.setQueryData(campaignKeys.detail(campaignId), campaign);
      } else if (campaignId) {
        queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
      }
      invalidateLists();
    };

    const handleCampaignDeleted = (data: unknown) => {
      const campaignId = (data as { campaignId?: string }).campaignId;
      if (campaignId) {
        queryClient.removeQueries({ queryKey: campaignKeys.detail(campaignId) });
        if (viewedCampaignId === campaignId) {
          navigate("/campaigns");
        }
      }
      invalidateLists();
    };

    const unsubJoined = subscribe("member_joined", handleMembershipChange);
    const unsubSession = subscribe("session_status_changed", handleMembershipChange);
    const unsubLeft = subscribe("member_left", handleMembershipChange);
    const unsubUpdated = subscribe("campaign_updated", handleCampaignUpdated);
    const unsubDeleted = subscribe("campaign_deleted", handleCampaignDeleted);

    return () => {
      unsubJoined();
      unsubSession();
      unsubLeft();
      unsubUpdated();
      unsubDeleted();
    };
  }, [subscribe, queryClient, navigate, viewedCampaignId]);

  return <Outlet />;
};
