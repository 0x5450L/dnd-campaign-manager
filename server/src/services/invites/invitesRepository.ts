import { CampaignMemberRole } from "@prisma/client";
import prisma from "../prisma";

const inviteWithCampaignDm = {
  campaign: { include: { dm: { select: { displayName: true } } } },
} as const;

export const findCampaignForMember = (campaignId: string, userId: string) =>
  prisma.campaign.findUnique({
    where: { id: campaignId, members: { some: { userId } } },
  });

export const findPendingInvite = (email: string, campaignId: string) =>
  prisma.campaignInvite.findFirst({
    where: {
      email,
      campaignId,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
  });

export const createInvite = (
  email: string | undefined,
  token: string,
  campaignId: string,
  expiresAt: Date,
) =>
  prisma.campaignInvite.create({
    data: { email, token, campaignId, expiresAt },
  });

export const findUserById = (userId: string) =>
  prisma.user.findUnique({ where: { id: userId } });

export const listPendingInvitesForEmail = (email: string) =>
  prisma.campaignInvite.findMany({
    where: {
      email,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    include: inviteWithCampaignDm,
  });

export const findInviteByTokenWithCampaign = (token: string) =>
  prisma.campaignInvite.findUnique({
    where: { token },
    include: inviteWithCampaignDm,
  });

export const findInviteByToken = (token: string) =>
  prisma.campaignInvite.findUnique({ where: { token } });

export const findMembership = (userId: string, campaignId: string) =>
  prisma.campaignMember.findUnique({
    where: { userId_campaignId: { userId, campaignId } },
  });

export const createMember = (userId: string, campaignId: string, role: CampaignMemberRole) =>
  prisma.campaignMember.create({ data: { userId, campaignId, role } });

export const deleteInvite = (token: string) =>
  prisma.campaignInvite.delete({ where: { token } });

export const listCampaignMembersWithEmail = (campaignId: string) =>
  prisma.campaignMember.findMany({
    where: { campaignId },
    include: { user: { select: { email: true } } },
  });
