import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaigns,
  updateCampaign,
} from "../services/api/campaigns";
import type { Campaign, CreateCampaignInput, UpdateCampaignPayload } from "../types/campaigns";
import { useAuthStore } from "../state/auth/authStore";

export const campaignKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignKeys.all, "list"] as const,
  details: () => [...campaignKeys.all, "detail"] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

export const useCampaignsQuery = () => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: campaignKeys.lists(),
    queryFn: async () => (await getCampaigns()).campaigns,
    enabled: !!token,
    refetchOnWindowFocus: true,
  });
};

export const useCampaignQuery = (id: string | undefined) => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: campaignKeys.detail(id ?? ""),
    queryFn: async () => (await getCampaign(id as string)).campaign,
    enabled: !!token && !!id,
  });
};

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCampaignInput) =>
      (await createCampaign(input.name, input.description, input.setting, input.imageUrl)).campaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export const useUpdateCampaignMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; payload: UpdateCampaignPayload }) =>
      (await updateCampaign(vars.id, vars.payload)).campaign,
    onSuccess: (campaign: Campaign) => {
      queryClient.setQueryData(campaignKeys.detail(campaign.id), campaign);
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};

export const useDeleteCampaignMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
};
