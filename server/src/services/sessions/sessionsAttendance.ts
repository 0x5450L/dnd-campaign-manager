import prisma from "../prisma";

export const findOpenAttendance = (userId: string) =>
  prisma.sessionAttendee.findFirst({
    where: { userId, leftAt: null, campaignSession: { status: "active" } },
    include: {
      campaignSession: {
        select: {
          id: true,
          campaignId: true,
          campaign: { select: { name: true } },
        },
      },
    },
  });

export const openAttendance = (campaignSessionId: string, userId: string) =>
  prisma.sessionAttendee.create({ data: { campaignSessionId, userId } });

export const closeAttendance = (campaignSessionId: string, userId: string) =>
  prisma.sessionAttendee.updateMany({
    where: { campaignSessionId, userId, leftAt: null },
    data: { leftAt: new Date() },
  });

export const closeAllAttendances = (campaignSessionId: string) =>
  prisma.sessionAttendee.updateMany({
    where: { campaignSessionId, leftAt: null },
    data: { leftAt: new Date() },
  });

export const isSessionAttendee = async (
  campaignSessionId: string,
  userId: string,
) =>
  !!(await prisma.sessionAttendee.findFirst({
    where: { campaignSessionId, userId, leftAt: null },
    select: { id: true },
  }));
