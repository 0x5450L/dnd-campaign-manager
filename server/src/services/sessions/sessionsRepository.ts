import prisma from "../prisma";
import { pickDefined, trimOrNull } from "../../utils/payload";
import type { UpdateSessionPayload } from "@shared/dto/session";

export const createSession = async (campaignId: string, title: string | undefined) => {
  const { _max } = await prisma.campaignSession.aggregate({
    where: { campaignId },
    _max: { number: true },
  });

  return prisma.campaignSession.create({
    data: {
      campaignId,
      number: (_max.number ?? 0) + 1,
      ...pickDefined({ title: trimOrNull(title) }),
    },
  });
};

export const listByCampaign = (campaignId: string) =>
  prisma.campaignSession.findMany({
    where: { campaignId },
    orderBy: { number: "desc" },
  });

export const findForMember = (id: string, userId: string) =>
  prisma.campaignSession.findUnique({
    where: { id, campaign: { members: { some: { userId } } } },
  });

export const findOwned = (id: string, userId: string) =>
  prisma.campaignSession.findUnique({
    where: { id, campaign: { dmId: userId } },
    select: { id: true },
  });

export const updateSession = (id: string, input: UpdateSessionPayload) =>
  prisma.campaignSession.update({
    where: { id },
    data: {
      ...pickDefined({
        status: input.status,
        title: trimOrNull(input.title),
        summary: trimOrNull(input.summary),
        notes: trimOrNull(input.notes),
      }),
      ...(input.status === "ended" && { endedAt: new Date() }),
    },
  });

export const deleteSession = (id: string) =>
  prisma.campaignSession.delete({ where: { id } });
