import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  advanceTurn as advanceTurnRequest,
  createParticipant as createParticipantRequest,
  deleteParticipant as deleteParticipantRequest,
  listEncounters,
  setInitiative as setInitiativeRequest,
  updateParticipant as updateParticipantRequest,
} from "../services/api/encounters";
import { useAuthStore } from "../state/auth/authStore";
import { getSocket } from "../services/socket";
import type {
  BulkInitiativePayload,
  CreateParticipantPayload,
  EncounterParticipantDTO,
  UpdateParticipantPayload,
} from "../types/encounter";
import type {
  EncounterUpdatedPayload,
  InitiativeUpdatedPayload,
  ParticipantRemovedPayload,
  ParticipantUpdatedPayload,
} from "../../../shared/dto/socketEvents";
import {
  mapEncounter,
  patchEncounterScalar,
  patchParticipant,
  removeParticipant,
  replaceParticipant,
  setParticipants,
  type EncounterList,
} from "../utils/encounterCache";

export const encounterKeys = {
  all: ["encounters"] as const,
  lists: () => [...encounterKeys.all, "list"] as const,
  list: (campaignSessionId: string) => [...encounterKeys.lists(), campaignSessionId] as const,
  details: () => [...encounterKeys.all, "detail"] as const,
  detail: (id: string) => [...encounterKeys.details(), id] as const,
};

export const useActiveEncounterQuery = (campaignSessionId: string | undefined) => {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: encounterKeys.list(campaignSessionId ?? ""),
    queryFn: async () => (await listEncounters(campaignSessionId as string)).encounters,
    enabled: !!token && !!campaignSessionId,
    select: (encounters) => encounters.find((e) => e.status === "active") ?? null,
  });
};

type UpdateParticipantVars = {
  encounterId: string;
  participantId: string;
  payload: UpdateParticipantPayload;
};

export const useUpdateParticipantMutation = (campaignSessionId: string | undefined) => {
  const queryClient = useQueryClient();
  const key = encounterKeys.list(campaignSessionId ?? "");

  return useMutation({
    mutationFn: async ({ encounterId, participantId, payload }: UpdateParticipantVars) =>
      (await updateParticipantRequest(encounterId, participantId, payload)).participant,
    onMutate: async ({ encounterId, participantId, payload }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<EncounterList>(key);
      queryClient.setQueryData<EncounterList>(key, (list) =>
        patchParticipant(list, encounterId, participantId, payload as Partial<EncounterParticipantDTO>),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (participant, { encounterId }) => {
      queryClient.setQueryData<EncounterList>(key, (list) =>
        replaceParticipant(list, encounterId, participant),
      );
    },
  });
};

export const useAdvanceTurnMutation = (campaignSessionId: string | undefined) => {
  const queryClient = useQueryClient();
  const key = encounterKeys.list(campaignSessionId ?? "");

  return useMutation({
    mutationFn: async (encounterId: string) => (await advanceTurnRequest(encounterId)).encounter,
    onMutate: async (encounterId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<EncounterList>(key);
      queryClient.setQueryData<EncounterList>(key, (list) =>
        mapEncounter(list, encounterId, (encounter) => {
          const total = encounter.participants.length;
          if (total === 0) return encounter;
          const nextIndex = (encounter.currentTurnIndex + 1) % total;
          const nextRound = nextIndex === 0 ? encounter.round + 1 : encounter.round;
          return { ...encounter, currentTurnIndex: nextIndex, round: nextRound };
        }),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (encounter) => {
      queryClient.setQueryData<EncounterList>(key, (list) => patchEncounterScalar(list, encounter));
    },
  });
};

export const useSetInitiativeMutation = (campaignSessionId: string | undefined) => {
  const queryClient = useQueryClient();
  const key = encounterKeys.list(campaignSessionId ?? "");

  return useMutation({
    mutationFn: async (vars: { encounterId: string; payload: BulkInitiativePayload }) =>
      (await setInitiativeRequest(vars.encounterId, vars.payload)).participants,
    onSuccess: (participants, { encounterId }) => {
      queryClient.setQueryData<EncounterList>(key, (list) =>
        setParticipants(list, encounterId, participants),
      );
    },
  });
};

type CreateParticipantVars = {
  encounterId: string;
  payload: CreateParticipantPayload;
};

export const useCreateParticipantMutation = (campaignSessionId: string | undefined) => {
  const queryClient = useQueryClient();
  const key = encounterKeys.list(campaignSessionId ?? "");

  return useMutation({
    mutationFn: async ({ encounterId, payload }: CreateParticipantVars) =>
      (await createParticipantRequest(encounterId, payload)).participant,
    onSuccess: (participant, { encounterId }) => {
      queryClient.setQueryData<EncounterList>(key, (list) =>
        replaceParticipant(list, encounterId, participant),
      );
    },
  });
};

type RemoveParticipantVars = {
  encounterId: string;
  participantId: string;
};

export const useRemoveParticipantMutation = (campaignSessionId: string | undefined) => {
  const queryClient = useQueryClient();
  const key = encounterKeys.list(campaignSessionId ?? "");

  return useMutation({
    mutationFn: async ({ encounterId, participantId }: RemoveParticipantVars) =>
      deleteParticipantRequest(encounterId, participantId),
    onMutate: async ({ encounterId, participantId }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<EncounterList>(key);
      queryClient.setQueryData<EncounterList>(key, (list) =>
        removeParticipant(list, encounterId, participantId),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
  });
};

export const useEncounterRealtimeSync = (
  campaignId: string | undefined,
  campaignSessionId: string | undefined,
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!campaignId || !campaignSessionId) return;
    const socket = getSocket();
    const key = encounterKeys.list(campaignSessionId);

    const handleParticipantUpdated = (payload: ParticipantUpdatedPayload) => {
      if (payload.campaignId !== campaignId) return;
      const list = queryClient.getQueryData<EncounterList>(key);
      if (!list?.some((e) => e.id === payload.encounterId)) {
        queryClient.invalidateQueries({ queryKey: key });
        return;
      }
      queryClient.setQueryData<EncounterList>(key, (current) =>
        replaceParticipant(current, payload.encounterId, payload.participant),
      );
    };

    const handleParticipantRemoved = (payload: ParticipantRemovedPayload) => {
      if (payload.campaignId !== campaignId) return;
      queryClient.setQueryData<EncounterList>(key, (current) =>
        removeParticipant(current, payload.encounterId, payload.participantId),
      );
    };

    const handleEncounterUpdated = (payload: EncounterUpdatedPayload) => {
      if (payload.campaignId !== campaignId) return;
      const list = queryClient.getQueryData<EncounterList>(key);
      if (!list?.some((e) => e.id === payload.encounter.id)) {
        queryClient.invalidateQueries({ queryKey: key });
        return;
      }
      queryClient.setQueryData<EncounterList>(key, (current) =>
        patchEncounterScalar(current, payload.encounter),
      );
    };

    const handleInitiativeUpdated = (payload: InitiativeUpdatedPayload) => {
      if (payload.campaignId !== campaignId) return;
      queryClient.setQueryData<EncounterList>(key, (current) =>
        setParticipants(current, payload.encounterId, payload.participants),
      );
    };

    socket.on("participant_updated", handleParticipantUpdated);
    socket.on("participant_removed", handleParticipantRemoved);
    socket.on("encounter_updated", handleEncounterUpdated);
    socket.on("initiative_updated", handleInitiativeUpdated);

    return () => {
      socket.off("participant_updated", handleParticipantUpdated);
      socket.off("participant_removed", handleParticipantRemoved);
      socket.off("encounter_updated", handleEncounterUpdated);
      socket.off("initiative_updated", handleInitiativeUpdated);
    };
  }, [campaignId, campaignSessionId, queryClient]);
};
