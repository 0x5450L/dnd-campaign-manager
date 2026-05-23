import type { Campaign } from "@prisma/client";
import prisma from "../services/prisma";
import { AppError } from "./errors";

export const requireCampaignDM = async (
  userId: string,
  campaignId: string,
): Promise<Campaign> => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, dmId: userId },
  });

  if (!campaign) {
    throw new AppError(404, "Campaign not found");
  }

  return campaign;
};

export const requireCampaignAccess = async (
  userId: string,
  campaignId: string,
): Promise<Campaign> => {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
      members: { some: { userId } },
    },
  });

  if (!campaign) {
    throw new AppError(404, "Campaign not found");
  }

  return campaign;
};
