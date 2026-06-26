import { notifyClient } from "../sseClients";

type MemberWithEmail = { user: { email: string } };

export const notifyInviteCreated = (
  email: string,
  token: string,
  expiresAt: Date,
) => {
  notifyClient(email, { type: "invite_created", invite: { token, expiresAt } });
};

export const notifyMemberJoined = (
  members: MemberWithEmail[],
  campaignId: string,
) => {
  members.forEach((member) => {
    notifyClient(member.user.email, { type: "member_joined", campaignId });
  });
};
