import { apiClient } from ".";
import type { CreateCampaignResponse, DeleteCampaignResponse, GetCampaignsResponse } from "../../types/campaigns";

export const createCampaign = async (name: string, description?: string, setting?: string, imageUrl?: string) => {
  return apiClient<CreateCampaignResponse>('/api/campaigns/create', {
    method: 'POST',
    body: JSON.stringify({ name, description, setting, imageUrl }),
  })
};

export const deleteCampaign = async (id: string) => {
  return apiClient<DeleteCampaignResponse>(`/api/campaigns/delete/${id}`, {
    method: 'DELETE',
  })
};

export const getCampaigns = async () => {
  return apiClient<GetCampaignsResponse>('/api/campaigns', {
    method: 'GET',
  })
};