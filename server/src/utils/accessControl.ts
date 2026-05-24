import type { Campaign } from "@prisma/client";
import prisma from "../services/prisma";
import { AppError } from "./errors";
import type { EncounterWithCampaignDM } from "../types/accessControl";

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

export const requireEncounterDM = async (
  userId: string,
  encounterId: string,
): Promise<EncounterWithCampaignDM> => {
  const encounter = await prisma.encounter.findUnique({
    where: {
      id: encounterId,
      campaignSession: { campaign: { dmId: userId } },
    },
    include: {
      campaignSession: { select: { campaign: { select: { dmId: true } } } },
    },
  });

  if (!encounter) {
    throw new AppError(404, "Encounter not found");
  }

  return encounter;
};

export const requireEncounterAccess = async (
  userId: string,
  encounterId: string,
): Promise<EncounterWithCampaignDM> => {
  const encounter = await prisma.encounter.findUnique({
    where: {
      id: encounterId,
      campaignSession: { campaign: { members: { some: { userId } } } },
    },
    include: {
      campaignSession: { select: { campaign: { select: { dmId: true } } } },
    },
  });

  if (!encounter) {
    throw new AppError(404, "Encounter not found");
  }

  return encounter;
};
