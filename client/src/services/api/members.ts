import { apiClient } from ".";
import type { MemberMutationResponse } from "@/types/members";

export const leaveCampaign = async (campaignId: string) => {
  return apiClient<MemberMutationResponse>(`/api/campaigns/${campaignId}/leave`, {
    method: "POST",
  });
};

export const removeMember = async (campaignId: string, userId: string) => {
  return apiClient<MemberMutationResponse>(`/api/campaigns/${campaignId}/members/${userId}`, {
    method: "DELETE",
  });
};
