export type MemberMutationResponse = {
  status: "ok" | "error";
  message: string;
  campaignId: string;
  userId: string;
};
