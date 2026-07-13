import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  advanceTurn as advanceTurnRequest,
  applyAbilityUsage as applyAbilityUsageRequest,
  rollInitiative as rollInitiativeRequest,
  createParticipant as createParticipantRequest,
  deleteParticipant as deleteParticipantRequest,
  listEncounters,
  setInitiative as setInitiativeRequest,
  updateParticipant as updateParticipantRequest,
} from "../services/api/encounters";
import { useAuthStore } from "../state/auth/authStore";
import { getSocket } from "../services/socket";
import type {
  AbilityUsageAction,
  BulkInitiativePayload,
  CreateParticipantPayload,
  UpdateParticipantPayload,
} from "../types/encounter";
import type {
  EncounterUpdatedPayload,
  InitiativeUpdatedPayload,
  ParticipantRemovedPayload,
  ParticipantUpdatedPayload,
  TurnAdvancedPayload,
} from "../../../shared/dto/socketEvents";
import {
  patchEncounterScalar,
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
    onSuccess: (participant, { encounterId }) => {
      queryClient.setQueryData<EncounterList>(key, (list) =>
        replaceParticipant(list, encounterId, participant),
      );
    },
  });
};

export const useRollInitiativeMutation = (campaignSessionId: string | undefined) => {
  const queryClient = useQueryClient();
  const key = encounterKeys.list(campaignSessionId ?? "");

  return useMutation({
    mutationFn: async ({
      encounterId,
      participantIds,
    }: {
      encounterId: string;
      participantIds?: string[];
    }) => (await rollInitiativeRequest(encounterId, { participantIds })).participants,
    onSuccess: (participants, { encounterId }) => {
      queryClient.setQueryData<EncounterList>(key, (list) =>
        setParticipants(list, encounterId, participants),
      );
    },
  });
};

type AbilityUsageVars = {
  encounterId: string;
  participantId: string;
  abilityId: string;
  action: AbilityUsageAction;
};

export const useAbilityUsageMutation = (campaignSessionId: string | undefined) => {
  const queryClient = useQueryClient();
  const key = encounterKeys.list(campaignSessionId ?? "");

  return useMutation({
    mutationFn: async ({ encounterId, participantId, abilityId, action }: AbilityUsageVars) =>
      (await applyAbilityUsageRequest(encounterId, participantId, abilityId, { action }))
        .participant,
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

    const handleTurnAdvanced = (payload: TurnAdvancedPayload) => {
      if (payload.campaignId !== campaignId) return;
      const list = queryClient.getQueryData<EncounterList>(key);
      if (!list?.some((e) => e.id === payload.encounter.id)) {
        queryClient.invalidateQueries({ queryKey: key });
        return;
      }
      queryClient.setQueryData<EncounterList>(key, (current) => {
        const patched = patchEncounterScalar(current, payload.encounter);
        return payload.participant
          ? replaceParticipant(patched, payload.encounter.id, payload.participant)
          : patched;
      });
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
    socket.on("turn_advanced", handleTurnAdvanced);

    return () => {
      socket.off("participant_updated", handleParticipantUpdated);
      socket.off("participant_removed", handleParticipantRemoved);
      socket.off("encounter_updated", handleEncounterUpdated);
      socket.off("initiative_updated", handleInitiativeUpdated);
      socket.off("turn_advanced", handleTurnAdvanced);
    };
  }, [campaignId, campaignSessionId, queryClient]);
};
