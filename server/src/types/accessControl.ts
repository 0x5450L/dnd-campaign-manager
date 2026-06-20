import type { Encounter } from "@prisma/client";

export type EncounterWithCampaignDM = Encounter & {
  campaignSession: { campaign: { id: string; dmId: string } };
};
