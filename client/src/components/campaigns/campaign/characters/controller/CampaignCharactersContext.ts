import { createContext } from "react";
import type { Character } from "../../../../../types/characters/characters";

export type CampaignCharactersContextValue = {
  characters: Character[];
  myCharacter: Character | null;
  isDM: boolean;
  isSheetLocked: boolean;
  openCharactersSidebar: () => void;
  openMyCharacter: () => void;
};

export const CampaignCharactersContext = createContext<CampaignCharactersContextValue | null>(null);
