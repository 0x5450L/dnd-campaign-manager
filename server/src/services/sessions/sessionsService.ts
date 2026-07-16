import { AppError } from "../../utils/errors";
import {
  requireCampaignAccess,
  requireCampaignDM,
} from "../../utils/accessControl";
import type { UpdateSessionPayload } from "@shared/dto/session";
import * as sessionsRepo from "./sessionsRepository";
import { requireCampaignId } from "./sessionsValidation";
import { notifySessionStatusChanged } from "./sessionsNotifications";

export const createSession = async (
  userId: string,
  campaignId: string | undefined,
  title: string | undefined,
) => {
  const id = requireCampaignId(campaignId, "campaignId is required");
  await requireCampaignDM(userId, id);
  const session = await sessionsRepo.createSession(id, title);
  notifySessionStatusChanged(id).catch((error) => {
    console.error("session_status_changed notify failed", error);
  });
  return session;
};

export const listSessions = async (
  userId: string,
  campaignId: string | undefined,
) => {
  const id = requireCampaignId(campaignId, "campaignId query param is required");
  await requireCampaignAccess(userId, id);
  return sessionsRepo.listByCampaign(id);
};

export const getSession = async (userId: string, id: string) => {
  const session = await sessionsRepo.findForMember(id, userId);
  if (!session) {
    throw new AppError(404, "Session not found");
  }
  return session;
};

export const updateSession = async (
  userId: string,
  id: string,
  body: UpdateSessionPayload,
) => {
  const existing = await sessionsRepo.findOwned(id, userId);
  if (!existing) {
    throw new AppError(404, "Session not found");
  }
  const session = await sessionsRepo.updateSession(id, body);
  if (body.status) {
    notifySessionStatusChanged(session.campaignId).catch((error) => {
      console.error("session_status_changed notify failed", error);
    });
  }
  return session;
};

export const deleteSession = async (userId: string, id: string) => {
  const existing = await sessionsRepo.findOwned(id, userId);
  if (!existing) {
    throw new AppError(404, "Session not found");
  }
  await sessionsRepo.deleteSession(id);
};
