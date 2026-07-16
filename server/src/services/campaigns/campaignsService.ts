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

import {
  notifyCampaignDeleted,
  notifyCampaignUpdated,
  notifyInvitesRevoked,
  notifyMemberLeft,
} from "./campaignsNotifications";

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

const toCampaignDTO = <T extends { sessions: { id: string }[] }>(campaign: T) => {
  const { sessions, ...rest } = campaign;
  return { ...rest, activeSessionId: sessions[0]?.id ?? null };
};

export const createCampaign = async (
  userId: string,
  body: CreateCampaignInput,
) => {
  const { id, dm } = await campaignsRepo.createCampaignWithDm(userId, body);
  return {
    id,
    dm,
    name: body.name,
    description: body.description,
    setting: body.setting,
    imageUrl: body.imageUrl,
    activeSessionId: null,
  };
};

export const listCampaigns = async (userId: string) => {
  const campaigns = await campaignsRepo.listUserCampaigns(userId);
  return campaigns.map(toCampaignDTO);
};

export const getCampaign = async (userId: string, id: string) => {
  const campaign = await campaignsRepo.findUserCampaign(id, userId);
  if (!campaign) {
    throw new AppError(404, "Campaign not found");
  }
  return toCampaignDTO(campaign);
};

export const deleteCampaign = async (userId: string, id: string) => {
  await requireCampaignDM(userId, id);
  const members = await campaignsRepo.listMembersWithEmail(id);
  const inviteEmails = await campaignsRepo.listInviteEmails(id);
  await campaignsRepo.deleteCampaignCascade(id);

  try {
    notifyCampaignDeleted(members, id);
  } catch (error) {
    console.error("campaign_deleted notify failed", error);
  }

  try {
    notifyInvitesRevoked(inviteEmails);
  } catch (error) {
    console.error("invite_revoked notify failed", error);
  }
};

export const updateCampaign = async (
  userId: string,
  id: string,
  body: UpdateCampaignInput,
) => {
  await requireCampaignDM(userId, id);
  const updated = await campaignsRepo.updateCampaign(id, body);
  const campaign = toCampaignDTO(updated);

  try {
    notifyCampaignUpdated(updated.members, campaign);
  } catch (error) {
    console.error("campaign_updated notify failed", error);
  }

  return campaign;
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
