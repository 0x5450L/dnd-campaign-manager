import type { User } from "./auth";

export type CreateCampaignResponse = {
  status: 'ok' | 'error';
  message: string;
  campaign: Campaign;
}

export type DeleteCampaignResponse = {
  status: 'ok' | 'error';
  message: string;
}

export type GetCampaignsResponse = {
  status: 'ok' | 'error';
  message: string;
  campaigns: Campaign[];
}

export type GetCampaignResponse = CreateCampaignResponse;

export type UpdateCampaignResponse = CreateCampaignResponse;

export type CreateCampaignInput = {
  name: string;
  description?: string;
  setting?: string;
  imageUrl?: string;
}

export type UpdateCampaignPayload = {
  name?: string;
  description?: string;
  setting?: string;
  imageUrl?: string;
}

export type Campaign = {
  id: string;
  dm: User;
  dmId: string;
  name: string;
  description: string;
  setting: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  members: CampaignMember[];
  activeSessionId: string | null;
}

type CampaignMember = {
  id: string;
  user: User;
  userId: string;
  campaignId: string;
  role: 'dm' | 'player';
  joinedAt: Date;
}

export type DM = CampaignMember & {
  role: 'dm';
}

export type Player = CampaignMember & {
  role: 'player';
}
