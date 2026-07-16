import type { CharacterDTO } from "@shared/dto/character";
import type { User } from "../auth";

export type {
  CharacterType,
  Alignment,
  HitDiceType,
  CharacterAbilityDTO,
  CharacterSkillDTO,
  CharacterAttackInput,
  CharacterAttackDTO,
  CharacterDTO,
  CreateCharacterPayload,
  UpdateCharacterPayload,
  CreatureProfileDTO,
  CreatureProfileInput,
} from "@shared/dto/character";

/** Character payload as returned by the API — DTO + optional `user` join used by the list view. */
export type Character = CharacterDTO & {
  user?: User;
};

export type CreateCharacterResponse = {
  status: "ok" | "error";
  message: string;
  character: Character;
};

export type GetCharacterResponse = CreateCharacterResponse;

export type UpdateCharacterResponse = CreateCharacterResponse;

export type DeleteCharacterResponse = {
  status: "ok" | "error";
  message: string;
  character: Character;
};

export type GetCampaignCharactersResponse = {
  status: "ok" | "error";
  message: string;
  characters: Character[];
};
