import prisma from "../prisma";
import { notifyClient } from "../sseClients";

export const notifySessionStatusChanged = async (campaignId: string) => {
  const members = await prisma.campaignMember.findMany({
    where: { campaignId },
    select: { user: { select: { email: true } } },
  });
  members.forEach((member) => {
    notifyClient(member.user.email, {
      type: "session_status_changed",
      campaignId,
    });
  });
};
