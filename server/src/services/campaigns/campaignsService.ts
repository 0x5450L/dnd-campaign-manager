import { AppError } from "../../utils/errors";
import {
  requireCampaignAccess,
  requireCampaignDM,
} from "../../utils/accessControl";
import * as campaignsRepo from "./campaignsRepository";
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
} from "./campaignsRepository";
import { requireCampaignName } from "./campaignsValidation";
import { notifyMemberLeft } from "./campaignsNotifications";

const removeMemberAndNotify = async (campaignId: string, targetUserId: string) => {
  const membership = await campaignsRepo.findMembership(campaignId, targetUserId);
  if (!membership) {
    throw new AppError(404, "Member not found");
  }

  await campaignsRepo.deleteMembership(campaignId, targetUserId);
  const remaining = await campaignsRepo.listMembersWithEmail(campaignId);

  try {
    notifyMemberLeft(remaining, membership.user.email, campaignId, targetUserId);
  } catch (error) {
    console.error("member_left notify failed", error);
  }
};

export const createCampaign = async (
  userId: string,
  body: CreateCampaignInput,
) => {
  const name = requireCampaignName(body.name);
  const { id, dm } = await campaignsRepo.createCampaignWithDm(userId, body);
  return {
    id,
    dm,
    name,
    description: body.description,
    setting: body.setting,
    imageUrl: body.imageUrl,
  };
};

export const listCampaigns = (userId: string) =>
  campaignsRepo.listUserCampaigns(userId);

export const getCampaign = async (userId: string, id: string) => {
  const campaign = await campaignsRepo.findUserCampaign(id, userId);
  if (!campaign) {
    throw new AppError(404, "Campaign not found");
  }
  return campaign;
};

export const deleteCampaign = async (userId: string, id: string) => {
  await requireCampaignDM(userId, id);
  await campaignsRepo.deleteCampaignCascade(id);
};

export const updateCampaign = async (
  userId: string,
  id: string,
  body: UpdateCampaignInput,
) => {
  await requireCampaignDM(userId, id);
  return campaignsRepo.updateCampaign(id, body);
};

export const leaveCampaign = async (userId: string, id: string) => {
  const campaign = await requireCampaignAccess(userId, id);
  if (campaign.dmId === userId) {
    throw new AppError(400, "The DM cannot leave the campaign. Delete it instead.");
  }
  await removeMemberAndNotify(id, userId);
};

export const removeMember = async (
  requesterId: string,
  id: string,
  targetUserId: string,
) => {
  const campaign = await requireCampaignDM(requesterId, id);
  if (targetUserId === campaign.dmId) {
    throw new AppError(400, "The DM cannot be removed from the campaign.");
  }
  await removeMemberAndNotify(id, targetUserId);
};
