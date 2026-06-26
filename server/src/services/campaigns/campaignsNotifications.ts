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

export const notifyInvitesRevoked = (emails: string[]) => {
  emails.forEach((email) => {
    notifyClient(email, { type: "invite_revoked" });
  });
};

export const notifyCampaignUpdated = (
  members: MemberWithEmail[],
  campaign: { id: string },
) => {
  members.forEach((member) => {
    notifyClient(member.user.email, {
      type: "campaign_updated",
      campaignId: campaign.id,
      campaign,
    });
  });
};

export const notifyCampaignDeleted = (
  members: MemberWithEmail[],
  campaignId: string,
) => {
  members.forEach((member) => {
    notifyClient(member.user.email, { type: "campaign_deleted", campaignId });
  });
};
