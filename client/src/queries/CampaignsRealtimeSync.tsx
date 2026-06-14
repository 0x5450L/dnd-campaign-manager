import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSSE } from "../hooks/useSSE";
import { campaignKeys } from "./campaigns";

export const CampaignsRealtimeSync = () => {
  const { subscribe } = useSSE();
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribe("member_joined", (data: unknown) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      const campaignId = (data as { campaignId?: string }).campaignId;
      if (campaignId) {
        queryClient.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
      }
    });
  }, [subscribe, queryClient]);

  return <Outlet />;
};
