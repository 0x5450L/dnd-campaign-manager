import type { User } from "./auth";

export type Character = {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'monster';
  level: number;
  race: string;
  characterClass: string;
  campaignId: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export type CreateCharacterPayload = {
  name: string;
  type: 'player' | 'npc' | 'monster';
  race: string;
  characterClass: string;
  campaignId: string;
  level?: number;
}

export type UpdateCharacterPayload = {
  name?: string;
  type?: 'player' | 'npc' | 'monster';
  race?: string;
  characterClass?: string;
  level?: number;
}

export type CreateCharacterResponse = {
  status: 'ok' | 'error';
  message: string;
  character: Character;
}

export type GetCharacterResponse = CreateCharacterResponse;

export type UpdateCharacterResponse = CreateCharacterResponse;

export type DeleteCharacterResponse = {
  status: 'ok' | 'error';
  message: string;
  character: Character;
}

export type GetCampaignCharactersResponse = {
  status: 'ok' | 'error';
  message: string;
  characters: Character[];
}
