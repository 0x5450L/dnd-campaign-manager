import { AppError } from "../../utils/errors";
import type { CreateCharacterPayload } from "../../../../shared/character";

export const requireCreateCharacterFields = (body: CreateCharacterPayload) => {
  if (
    !body.name ||
    !body.type ||
    !body.race ||
    !body.characterClass ||
    !body.campaignId
  ) {
    throw new AppError(400, "Provide all necessary character details");
  }
};

export const requireCampaignId = (value: string | undefined): string => {
  if (!value) {
    throw new AppError(400, "Campaign ID is required");
  }
  return value;
};

export const requireCharacterId = (value: string | undefined): string => {
  if (!value) {
    throw new AppError(400, "Character ID is required");
  }
  return value;
};
