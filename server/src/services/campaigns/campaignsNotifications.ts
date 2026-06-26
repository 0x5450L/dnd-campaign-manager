import { notifyClient } from "../sseClients";

type MemberWithEmail = { user: { email: string } };

export const notifyMemberLeft = (
  remaining: MemberWithEmail[],
  leaverEmail: string,
  campaignId: string,
  userId: string,
) => {
  const event = { type: "member_left" as const, campaignId, userId };
  remaining.forEach((member) => notifyClient(member.user.email, event));
  notifyClient(leaverEmail, event);
};
