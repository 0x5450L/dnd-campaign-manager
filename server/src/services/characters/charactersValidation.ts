import { AppError } from "../../utils/errors";
import type {
  CharacterType,
  CreateCharacterPayload,
  CreatureProfileInput,
} from "@shared/dto/character";

const MISSING_FIELD_LABELS: Record<string, string> = {
  name: "name",
  type: "character type",
  race: "species",
  characterClass: "class",
  campaignId: "campaign",
};

export const requireCreateCharacterFields = (body: CreateCharacterPayload) => {
  const required: (keyof CreateCharacterPayload)[] =
    body.type === "monster"
      ? ["name", "type", "campaignId"]
      : ["name", "type", "race", "characterClass", "campaignId"];

  const missing = required.filter((field) => !body[field]);

  if (missing.length > 0) {
    const labels = missing.map((field) => MISSING_FIELD_LABELS[field] ?? field);
    throw new AppError(400, `Fill in the ${labels.join(", ")} before saving`);
  }
};

export const requireMonsterForCreatureProfile = (
  type: CharacterType,
  creatureProfile: CreatureProfileInput | undefined,
) => {
  if (creatureProfile !== undefined && type !== "monster") {
    throw new AppError(400, "Creature profile is only allowed for monsters");
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
