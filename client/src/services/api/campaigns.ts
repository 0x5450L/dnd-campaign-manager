import { apiClient } from ".";
import type { CreateCampaignResponse, GetCampaignsResponse } from "../../types/campaigns";

export const createCampaign = async (name: string, description?: string, setting?: string, imageUrl?: string) => {
  return apiClient<CreateCampaignResponse>('/api/campaigns/create', {
    method: 'POST',
    body: JSON.stringify({ name, description, setting, imageUrl }),
  })
};

export const getCampaigns = async () => {
  return apiClient<GetCampaignsResponse>('/api/campaigns', {
    method: 'GET',
  })
};