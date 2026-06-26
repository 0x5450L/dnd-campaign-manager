import { randomUUID } from "crypto";
import { AppError } from "../../utils/errors";
import * as invitesRepo from "./invitesRepository";
import {
  notifyInviteCreated,
  notifyMemberJoined,
} from "./invitesNotifications";

const WEEK_MS = 1000 * 60 * 60 * 24 * 7;

export const createInvite = async (
  userId: string,
  email: string | undefined,
  campaignId: string,
) => {
  const campaign = await invitesRepo.findCampaignForMember(campaignId, userId);
  if (!campaign) {
    throw new AppError(404, "Campaign not found. To invite to a campaign you must participate in it");
  }

  if (email) {
    const existing = await invitesRepo.findPendingInvite(email, campaignId);
    if (existing) {
      return { token: existing.token, expiresAt: existing.expiresAt, alreadyExisted: true };
    }
  }

  const expiresAt = new Date(Date.now() + WEEK_MS);
  const token = randomUUID();
  await invitesRepo.createInvite(email, token, campaignId, expiresAt);

  if (email) {
    try {
      notifyInviteCreated(email, token, expiresAt);
    } catch (error) {
      console.error("invite_created notify failed", error);
    }
  }

  return { token, expiresAt, alreadyExisted: false };
};

export const listMyInvites = async (userId: string) => {
  const user = await invitesRepo.findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return invitesRepo.listPendingInvitesForEmail(user.email);
};

export const getStreamUser = (userId: string) => invitesRepo.findUserById(userId);

export const getInviteByToken = async (token: string) => {
  const invite = await invitesRepo.findInviteByTokenWithCampaign(token);
  if (!invite) {
    throw new AppError(404, "Invite not found");
  }
  return invite;
};

export const respondToInvite = async (
  userId: string,
  token: string,
  action: "accept" | "reject",
) => {
  const invite = await invitesRepo.findInviteByToken(token);
  if (!invite) {
    throw new AppError(404, "Invite not found");
  }
  if (invite.expiresAt < new Date()) {
    throw new AppError(400, "Invite expired");
  }
  if (invite.status !== "pending") {
    throw new AppError(400, "Invite already responded");
  }

  const existingMember = await invitesRepo.findMembership(userId, invite.campaignId);
  if (existingMember) {
    throw new AppError(400, "You are already a member of this campaign");
  }

  switch (action) {
    case "accept": {
      await invitesRepo.createMember(userId, invite.campaignId, "player");
      if (invite.email) {
        await invitesRepo.deleteInvite(token);
      }
      const members = await invitesRepo.listCampaignMembersWithEmail(invite.campaignId);
      try {
        notifyMemberJoined(members, invite.campaignId);
      } catch (error) {
        console.error("member_joined notify failed", error);
      }
      break;
    }
    case "reject":
      await invitesRepo.deleteInvite(token);
      break;
    default:
      throw new AppError(400, "Invalid action");
  }
};
