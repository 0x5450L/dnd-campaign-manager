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
}

type CampaignMember = {
  id: string;
  userId: string;
  campaignId: string;
  role: 'DM' | 'PLAYER';
  joinedAt: Date;
}

export type DM = CampaignMember & {
  role: 'DM';
}

export type Player = CampaignMember & {
  role: 'PLAYER';
}
