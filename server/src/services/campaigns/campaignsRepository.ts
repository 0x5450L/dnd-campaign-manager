import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { pickDefined } from "../../utils/payload";

export type CreateCampaignInput = {
  name: string;
  description?: string | null;
  setting?: string | null;
  imageUrl?: string | null;
};

export type UpdateCampaignInput = {
  name?: string;
  description?: string | null;
  setting?: string | null;
  imageUrl?: string | null;
};

const campaignWithMembersInclude = {
  dm: { select: { id: true, displayName: true, email: true } },
  members: {
    include: { user: { select: { id: true, displayName: true, email: true } } },
  },
} satisfies Prisma.CampaignInclude;

export const createCampaignWithDm = (userId: string, input: CreateCampaignInput) =>
  prisma.$transaction(async (tx) => {
    const { id } = await tx.campaign.create({
      data: {
        dmId: userId,
        name: input.name,
        description: input.description,
        setting: input.setting,
        imageUrl: input.imageUrl,
      },
    });

    const dm = await tx.campaignMember.create({
      data: { userId, campaignId: id, role: "dm" },
    });

    return { id, dm };
  });

export const listUserCampaigns = (userId: string) =>
  prisma.campaign.findMany({
    where: { members: { some: { userId } } },
    include: campaignWithMembersInclude,
  });

export const findUserCampaign = (id: string, userId: string) =>
  prisma.campaign.findUnique({
    where: { id, members: { some: { userId } } },
    include: campaignWithMembersInclude,
  });

export const deleteCampaignCascade = (campaignId: string) =>
  prisma.$transaction(async (tx) => {
    await tx.campaignInvite.deleteMany({ where: { campaignId } });
    await tx.campaignMember.deleteMany({ where: { campaignId } });
    await tx.character.deleteMany({ where: { campaignId } });
    await tx.campaign.delete({ where: { id: campaignId } });
  });

export const listInviteEmails = async (campaignId: string): Promise<string[]> => {
  const invites = await prisma.campaignInvite.findMany({
    where: { campaignId, email: { not: null } },
    select: { email: true },
  });
  return invites
    .map((invite) => invite.email)
    .filter((email): email is string => email !== null);
};

export const updateCampaign = (id: string, input: UpdateCampaignInput) =>
  prisma.campaign.update({
    where: { id },
    data: {
      ...(input.name?.trim() && { name: input.name.trim() }),
      ...pickDefined({
        description: input.description,
        setting: input.setting,
        imageUrl: input.imageUrl,
      }),
    },
    include: campaignWithMembersInclude,
  });

export const findMembership = (campaignId: string, userId: string) =>
  prisma.campaignMember.findUnique({
    where: { userId_campaignId: { userId, campaignId } },
    include: { user: { select: { email: true } } },
  });

export const deleteMembership = (campaignId: string, userId: string) =>
  prisma.campaignMember.delete({
    where: { userId_campaignId: { userId, campaignId } },
  });

export const listMembersWithEmail = (campaignId: string) =>
  prisma.campaignMember.findMany({
    where: { campaignId },
    include: { user: { select: { email: true } } },
  });
