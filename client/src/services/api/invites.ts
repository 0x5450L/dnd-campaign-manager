import { apiClient } from ".";
import type { CreateInviteResponse, GetInviteByTokenResponse, GetInvitesResponse, RespondToInviteResponse } from "@/types/invites";

export const createInvite = async (campaignId: string, email?: string,) => {
  return apiClient<CreateInviteResponse>('/api/invites/create', {
    method: 'POST',
    body: JSON.stringify({ campaignId, email }),
  })
}

export const getMyInvites = async () => {
  return apiClient<GetInvitesResponse>('/api/invites/my', {
    method: 'GET',
  })
};

export const getInviteByToken = async (token: string) => {
  return apiClient<GetInviteByTokenResponse>(`/api/invites/${token}`, {
    method: 'GET',
  })
};

export const respondToInvite = async (token: string, action: 'accept' | 'reject') => {
  return apiClient<RespondToInviteResponse>(`/api/invites/${token}/respond`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  })
};