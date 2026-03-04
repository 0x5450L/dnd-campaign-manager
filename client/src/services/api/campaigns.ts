import { apiClient } from ".";
import type { CreateCampaignResponse, DeleteCampaignResponse, GetCampaignResponse, GetCampaignsResponse, UpdateCampaignResponse } from "../../types/campaigns";

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

export const getCampaign = async (id: string) => {
  return apiClient<GetCampaignResponse>(`/api/campaigns/${id}`, {
    method: 'GET',
  })
};

export const updateCampaign = async (id: string, payload: { name?: string, description?: string, setting?: string, imageUrl?: string }) => {
  return apiClient<UpdateCampaignResponse>(`/api/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
};