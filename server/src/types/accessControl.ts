import type { Encounter } from "@prisma/client";

export type EncounterWithCampaignDM = Encounter & {
  campaignSession: { campaign: { dmId: string } };
};
