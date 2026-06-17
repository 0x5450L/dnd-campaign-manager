import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveCampaign, removeMember } from "../services/api/members";
import { campaignKeys } from "./campaigns";
import type { Campaign } from "../types/campaigns";

export const useLeaveCampaignMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => leaveCampaign(campaignId),
    onSuccess: (_data, campaignId) => {
      queryClient.removeQueries({ queryKey: campaignKeys.detail(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { campaignId: string; userId: string }) =>
      removeMember(vars.campaignId, vars.userId),
    onSuccess: (_data, vars) => {
      queryClient.setQueryData<Campaign>(campaignKeys.detail(vars.campaignId), (current) =>
        current
          ? { ...current, members: current.members.filter((m) => m.userId !== vars.userId) }
          : current,
      );
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};
