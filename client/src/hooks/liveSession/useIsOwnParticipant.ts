import { useCallback, useMemo } from "react";
import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useMeQuery } from "@/queries/auth";
import { useCampaignCharactersQuery } from "@/queries/characters";
import type { EncounterParticipantDTO } from "@/types/encounter";

export const useIsOwnParticipant = () => {
  const campaignId = useLiveSessionStore((s) => s.activeCampaignId);
  const { data: user } = useMeQuery();
  const { data: campaignCharacters } = useCampaignCharactersQuery(campaignId ?? undefined);

  const myCharacterIds = useMemo(
    () =>
      new Set(
        (campaignCharacters ?? [])
          .filter((c) => c.userId === user?.id)
          .map((c) => c.id),
      ),
    [campaignCharacters, user?.id],
  );

  return useCallback(
    (participant: EncounterParticipantDTO) =>
      participant.characterId !== null && myCharacterIds.has(participant.characterId),
    [myCharacterIds],
  );
};
