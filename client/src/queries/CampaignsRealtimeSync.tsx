import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSSE } from "../hooks/useSSE";
import { campaignKeys } from "./campaigns";

export const CampaignsRealtimeSync = () => {
  const { subscribe } = useSSE();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMembershipChange = (data: unknown) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      const campaignId = (data as { campaignId?: string }).campaignId;
      if (campaignId) {
        queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
      }
    };

    const unsubJoined = subscribe("member_joined", handleMembershipChange);
    const unsubLeft = subscribe("member_left", handleMembershipChange);

    return () => {
      unsubJoined();
      unsubLeft();
    };
  }, [subscribe, queryClient]);

  return <Outlet />;
};
