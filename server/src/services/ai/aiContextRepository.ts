import prisma from "../prisma";

const PARTY_LIMIT = 8;

export type CampaignPartyMember = {
  name: string;
  race: string;
  characterClass: string;
};

export type CampaignLootContext = {
  name: string;
  setting: string | null;
  description: string | null;
  party: CampaignPartyMember[];
};

export const loadCampaignLootContext = async (
  campaignId: string,
): Promise<CampaignLootContext | null> => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      name: true,
      setting: true,
      description: true,
      characters: {
        where: { type: "player" },
        select: { name: true, race: true, characterClass: true },
        take: PARTY_LIMIT,
      },
    },
  });

  if (!campaign) {
    return null;
  }

  return {
    name: campaign.name,
    setting: campaign.setting,
    description: campaign.description,
    party: campaign.characters,
  };
};
