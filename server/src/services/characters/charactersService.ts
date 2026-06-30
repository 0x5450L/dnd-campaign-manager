import { AppError } from "../../utils/errors";
import { requireCampaignAccess } from "../../utils/accessControl";
import type {
  CreateCharacterPayload,
  UpdateCharacterPayload,
} from "../../../../shared/dto/character";
import * as charactersRepo from "./charactersRepository";
import type { CharacterWithCampaignAccess } from "./charactersRepository";
import {
  requireCampaignId,
  requireCharacterId,
  requireCreateCharacterFields,
} from "./charactersValidation";
import {
  notifyCharacterCreated,
  notifyCharacterDeleted,
  notifyCharacterUpdated,
} from "./charactersNotifications";

const assertCharacterAccess = (
  character: CharacterWithCampaignAccess | null,
  userId: string,
): CharacterWithCampaignAccess => {
  if (
    !character ||
    (character.userId !== userId && character.campaign.dmId !== userId)
  ) {
    throw new AppError(404, "Character not found or you are not the owner of it");
  }
  return character;
};

export const createCharacter = async (
  userId: string,
  body: CreateCharacterPayload,
) => {
  requireCreateCharacterFields(body);

  const campaign = await charactersRepo.findCampaignForMember(body.campaignId, userId);
  if (!campaign) {
    throw new AppError(404, "Campaign not found or you are not a member of it");
  }

  const character = await charactersRepo.createCharacter(userId, body);

  try {
    notifyCharacterCreated(campaign.members, character.id, body.campaignId);
  } catch (error) {
    console.error("character_created notify failed", error);
  }

  return character;
};

export const listCampaignCharacters = async (
  userId: string,
  campaignId: string | undefined,
) => {
  const id = requireCampaignId(campaignId);
  await requireCampaignAccess(userId, id);
  return charactersRepo.listCampaignCharacters(id);
};

export const updateCharacter = async (
  userId: string,
  id: string | undefined,
  body: UpdateCharacterPayload,
) => {
  const characterId = requireCharacterId(id);

  const current = assertCharacterAccess(
    await charactersRepo.findCharacterWithCampaignAccess(characterId),
    userId,
  );

  const isDM = current.campaign.dmId === userId;
  if (!isDM) {
    const activeEncounter = await charactersRepo.findActiveEncounter(current.campaignId);
    if (activeEncounter) {
      throw new AppError(403, "Character sheet is locked during an active encounter");
    }
  }

  const character = await charactersRepo.updateCharacter(characterId, body);

  try {
    notifyCharacterUpdated(current.campaign.members, character, character.campaignId);
  } catch (error) {
    console.error("character_updated notify failed", error);
  }

  return character;
};

export const deleteCharacter = async (userId: string, id: string | undefined) => {
  const characterId = requireCharacterId(id);

  const character = assertCharacterAccess(
    await charactersRepo.findCharacterWithCampaignAccess(characterId),
    userId,
  );

  await charactersRepo.deleteCharacter(characterId);

  try {
    notifyCharacterDeleted(character.campaign.members, characterId, character.campaignId);
  } catch (error) {
    console.error("character_deleted notify failed", error);
  }

  return character;
};

export const getCharacter = async (userId: string, id: string) => {
  const character = await charactersRepo.findCharacterForMember(id, userId);
  if (!character) {
    throw new AppError(404, "Character not found or you are not a member of the campaign");
  }
  return character;
};
