export type CreateCampaignResponse = {
  status: 'ok' | 'error';
  message: string;
  campaign: Campaign;
}

export type Campaign = {
  id: string;
  dm: DM;
  name: string;
  description: string;
  setting: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
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
