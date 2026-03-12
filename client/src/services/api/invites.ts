import { apiClient } from ".";
import type { GetInvitesResponse, RespondToInviteResponse } from "../../types/invites";

export const getMyInvites = async () => {
  return apiClient<GetInvitesResponse>('/api/invites/my', {
    method: 'GET',
  })
};

export const respondToInvite = async (token: string, action: 'accept' | 'reject') => {
  return apiClient<RespondToInviteResponse>(`/api/invites/${token}/respond`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  })
};