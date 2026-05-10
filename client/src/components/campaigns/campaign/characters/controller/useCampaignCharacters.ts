import { useContext } from "react";
import { CampaignCharactersContext } from "./CampaignCharactersContext";

export const useCampaignCharacters = () => {
  const ctx = useContext(CampaignCharactersContext);
  if (!ctx) {
    throw new Error("useCampaignCharacters must be used within CampaignCharactersController");
  }
  return ctx;
};
