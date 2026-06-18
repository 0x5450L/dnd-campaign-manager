import { apiClient } from ".";
import type {
  BulkCreateParticipantsPayload,
  BulkCreateParticipantsResponse,
  CreateEncounterPayload,
  CreateEncounterResponse,
  CreateParticipantPayload,
  CreateParticipantResponse,
  DeleteEncounterResponse,
  DeleteParticipantResponse,
  DeleteParticipantsResponse,
  GetEncounterResponse,
  ListEncountersResponse,
  NextTurnResponse,
  SetInitiativeResponse,
  UpdateEncounterPayload,
  UpdateEncounterResponse,
  UpdateParticipantPayload,
  UpdateParticipantResponse,
  BulkInitiativePayload,
} from "../../types/encounter";

export const listEncounters = async (campaignSessionId: string) => {
  return apiClient<ListEncountersResponse>(
    `/api/encounters?campaignSessionId=${encodeURIComponent(campaignSessionId)}`,
    { method: "GET" },
  );
};

export const getEncounter = async (id: string) => {
  return apiClient<GetEncounterResponse>(`/api/encounters/${id}`, {
    method: "GET",
  });
};

export const createEncounter = async (
  campaignSessionId: string,
  payload: CreateEncounterPayload,
) => {
  return apiClient<CreateEncounterResponse>(`/api/encounters`, {
    method: "POST",
    body: JSON.stringify({ campaignSessionId, ...payload }),
  });
};

export const updateEncounter = async (id: string, payload: UpdateEncounterPayload) => {
  return apiClient<UpdateEncounterResponse>(`/api/encounters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteEncounter = async (id: string) => {
  return apiClient<DeleteEncounterResponse>(`/api/encounters/${id}`, {
    method: "DELETE",
  });
};

export const advanceTurn = async (id: string) => {
  return apiClient<NextTurnResponse>(`/api/encounters/${id}/next-turn`, {
    method: "POST",
  });
};

export const setInitiative = async (id: string, payload: BulkInitiativePayload) => {
  return apiClient<SetInitiativeResponse>(`/api/encounters/${id}/initiative`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const createParticipant = async (id: string, payload: CreateParticipantPayload) => {
  return apiClient<CreateParticipantResponse>(`/api/encounters/${id}/participants`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const bulkCreateParticipants = async (
  id: string,
  payload: BulkCreateParticipantsPayload,
) => {
  return apiClient<BulkCreateParticipantsResponse>(`/api/encounters/${id}/participants/bulk`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateParticipant = async (
  id: string,
  pid: string,
  payload: UpdateParticipantPayload,
) => {
  return apiClient<UpdateParticipantResponse>(`/api/encounters/${id}/participants/${pid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteParticipants = async (id: string, ids: string[]) => {
  return apiClient<DeleteParticipantsResponse>(
    `/api/encounters/${id}/participants?ids=${encodeURIComponent(ids.join(","))}`,
    { method: "DELETE" },
  );
};

export const deleteParticipant = async (id: string, pid: string) => {
  return apiClient<DeleteParticipantResponse>(`/api/encounters/${id}/participants/${pid}`, {
    method: "DELETE",
  });
};
