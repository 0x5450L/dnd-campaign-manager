import { apiClient } from ".";
import type {
  CreateCharacterPayload,
  CreateCharacterResponse,
  DeleteCharacterResponse,
  GetCampaignCharactersResponse,
  GetCharacterResponse,
  UpdateCharacterPayload,
  UpdateCharacterResponse,
} from "../../types/characters/characters";

export const createCharacter = async (payload: CreateCharacterPayload) => {
  return apiClient<CreateCharacterResponse>('/api/characters/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getCampaignCharacters = async (campaignId: string) => {
  return apiClient<GetCampaignCharactersResponse>(`/api/characters/campaign-characters/${campaignId}`, {
    method: 'GET',
  });
};

export const getCharacter = async (id: string) => {
  return apiClient<GetCharacterResponse>(`/api/characters/${id}`, {
    method: 'GET',
  });
};

export const updateCharacter = async (id: string, payload: UpdateCharacterPayload) => {
  return apiClient<UpdateCharacterResponse>(`/api/characters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteCharacter = async (id: string) => {
  return apiClient<DeleteCharacterResponse>(`/api/characters/${id}`, {
    method: 'DELETE',
  });
};
