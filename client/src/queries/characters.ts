import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCharacter,
  deleteCharacter,
  getCampaignCharacters,
  getCharacter,
  updateCharacter,
} from "../services/api/characters";
import type {
  Character,
  CreateCharacterPayload,
  UpdateCharacterPayload,
} from "../types/characters/characters";
import { useAuth } from "../hooks/useAuth";
import { useSSE } from "../hooks/useSSE";

export const characterKeys = {
  all: ["characters"] as const,
  lists: () => [...characterKeys.all, "list"] as const,
  list: (campaignId: string) => [...characterKeys.lists(), campaignId] as const,
  details: () => [...characterKeys.all, "detail"] as const,
  detail: (id: string) => [...characterKeys.details(), id] as const,
};

export const useCampaignCharactersQuery = (campaignId: string | undefined) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: characterKeys.list(campaignId ?? ""),
    queryFn: async () => (await getCampaignCharacters(campaignId as string)).characters,
    enabled: !!token && !!campaignId,
  });
};

export const useCharacterQuery = (id: string | undefined) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: characterKeys.detail(id ?? ""),
    queryFn: async () => (await getCharacter(id as string)).character,
    enabled: !!token && !!id,
  });
};

const upsertIntoList = (current: Character[] | undefined, character: Character) => {
  if (!current) return current;
  const exists = current.some((c) => c.id === character.id);
  return exists
    ? current.map((c) => (c.id === character.id ? character : c))
    : [...current, character];
};

export const useCreateCharacterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCharacterPayload) =>
      (await createCharacter(payload)).character,
    onSuccess: (character) => {
      queryClient.setQueryData(characterKeys.detail(character.id), character);
      queryClient.setQueryData<Character[]>(characterKeys.list(character.campaignId), (current) =>
        upsertIntoList(current, character),
      );
    },
  });
};

export const useUpdateCharacterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; payload: UpdateCharacterPayload }) =>
      (await updateCharacter(vars.id, vars.payload)).character,
    onSuccess: (character) => {
      queryClient.setQueryData(characterKeys.detail(character.id), character);
      queryClient.setQueryData<Character[]>(characterKeys.list(character.campaignId), (current) =>
        upsertIntoList(current, character),
      );
    },
  });
};

export const useDeleteCharacterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await deleteCharacter(id)).character,
    onSuccess: (character) => {
      queryClient.removeQueries({ queryKey: characterKeys.detail(character.id) });
      queryClient.setQueryData<Character[]>(characterKeys.list(character.campaignId), (current) =>
        current?.filter((c) => c.id !== character.id),
      );
    },
  });
};

export const useCharactersRealtimeSync = (campaignId: string | undefined) => {
  const { subscribe } = useSSE();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!campaignId) return;

    const matchesCampaign = (data: unknown) =>
      (data as { campaignId?: string }).campaignId === campaignId;

    const invalidateList = () => {
      queryClient.invalidateQueries({ queryKey: characterKeys.list(campaignId) });
    };

    const unsubCreated = subscribe("character_created", (data) => {
      if (matchesCampaign(data)) invalidateList();
    });
    const unsubUpdated = subscribe("character_updated", (data) => {
      if (!matchesCampaign(data)) return;
      const { characterId, character } = data as {
        characterId?: string;
        character?: Character;
      };
      if (character && characterId) {
        queryClient.setQueryData(characterKeys.detail(characterId), character);
        queryClient.setQueryData<Character[]>(characterKeys.list(campaignId), (current) =>
          upsertIntoList(current, character),
        );
        return;
      }
      invalidateList();
      if (characterId) {
        queryClient.invalidateQueries({ queryKey: characterKeys.detail(characterId) });
      }
    });
    const unsubDeleted = subscribe("character_deleted", (data) => {
      if (!matchesCampaign(data)) return;
      const { characterId } = data as { characterId?: string };
      if (characterId) {
        queryClient.removeQueries({ queryKey: characterKeys.detail(characterId) });
      }
      invalidateList();
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [campaignId, subscribe, queryClient]);
};
