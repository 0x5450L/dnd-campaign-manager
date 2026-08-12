import { useMemo } from "react";
import { MAX_PARTY_SIZE, MIN_PARTY_SIZE } from "@shared/constants/encounter";
import { MIN_LEVEL } from "@shared/constants/dndMath";
import { clamp, getLevelFromXp } from "@shared/utils/dndMath";
import { useCampaignCharactersQuery } from "@/queries/characters";

export type CampaignPartyProfile = {
  partyLevel: number;
  partySize: number;
  isResolved: boolean;
};

const FALLBACK: CampaignPartyProfile = {
  partyLevel: MIN_LEVEL,
  partySize: 4,
  isResolved: false,
};

export const useCampaignPartyProfile = (
  campaignId: string | undefined,
): CampaignPartyProfile => {
  const { data: characters } = useCampaignCharactersQuery(campaignId);

  return useMemo(() => {
    const players = characters?.filter((character) => character.type === "player");
    if (!players || players.length === 0) {
      return FALLBACK;
    }
    const levels = players.map((player) => getLevelFromXp(player.experience));
    const averageLevel = Math.round(
      levels.reduce((sum, level) => sum + level, 0) / levels.length,
    );
    return {
      partyLevel: averageLevel,
      partySize: clamp(players.length, MIN_PARTY_SIZE, MAX_PARTY_SIZE),
      isResolved: true,
    };
  }, [characters]);
};
