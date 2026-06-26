import { AppError } from "../../utils/errors";
import type {
  BulkInitiativeEntry,
  CreateParticipantPayload,
} from "../../../../shared/session";

export const requireCampaignSessionId = (
  value: string | undefined,
  message: string,
): string => {
  if (!value) {
    throw new AppError(400, message);
  }
  return value;
};

export const requireParticipantFields = (
  input: CreateParticipantPayload,
  message: string,
) => {
  if (
    !input.type ||
    !input.name ||
    input.sortOrder === undefined ||
    input.maxHp === undefined ||
    input.currentHp === undefined ||
    input.armorClass === undefined
  ) {
    throw new AppError(400, message);
  }
};

export const requireInitiativeEntries = (
  entries: BulkInitiativeEntry[] | undefined,
): BulkInitiativeEntry[] => {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new AppError(400, "entries array is required");
  }
  return entries;
};

export const requireParticipantsPayload = (
  participants: CreateParticipantPayload[] | undefined,
): CreateParticipantPayload[] => {
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new AppError(400, "participants array is required");
  }
  for (const participant of participants) {
    requireParticipantFields(
      participant,
      "Each participant requires type, name, sortOrder, maxHp, currentHp, armorClass",
    );
  }
  return participants;
};

export const parseParticipantIds = (idsParam: string | undefined): string[] => {
  if (!idsParam) {
    throw new AppError(400, "ids query param is required");
  }
  const ids = idsParam.split(",").map((value) => value.trim()).filter(Boolean);
  if (ids.length === 0) {
    throw new AppError(400, "ids query param is empty");
  }
  return ids;
};
