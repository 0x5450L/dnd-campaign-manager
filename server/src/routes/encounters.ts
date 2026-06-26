import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import type {
  BulkCreateParticipantsPayload,
  BulkInitiativePayload,
  CreateParticipantPayload,
  UpdateEncounterPayload,
  UpdateParticipantPayload,
} from "../../../shared/session";
import * as encountersService from "../services/encounters";

const router = Router();

router.post("/", authMiddleware, asyncHandler(async (req, res) => {
  const { campaignSessionId, name } = req.body;
  const encounter = await encountersService.createEncounter(req.userId!, campaignSessionId, name);
  res.json({ status: "ok", message: "Encounter created", encounter });
}));

router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const campaignSessionId = req.query.campaignSessionId as string | undefined;
  const encounters = await encountersService.listEncounters(req.userId!, campaignSessionId);
  res.json({ status: "ok", encounters });
}));

router.get<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const encounter = await encountersService.getEncounter(req.userId!, req.params.id);
  res.json({ status: "ok", encounter });
}));

router.patch<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const encounter = await encountersService.updateEncounter(
    req.userId!,
    req.params.id,
    req.body as UpdateEncounterPayload,
  );
  res.json({ status: "ok", encounter });
}));

router.delete<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  await encountersService.deleteEncounter(req.userId!, req.params.id);
  res.json({ status: "ok", message: "Encounter deleted" });
}));

router.post<{ id: string }>("/:id/next-turn", authMiddleware, asyncHandler(async (req, res) => {
  const encounter = await encountersService.advanceTurn(req.userId!, req.params.id);
  res.json({ status: "ok", encounter });
}));

router.patch<{ id: string }>("/:id/initiative", authMiddleware, asyncHandler(async (req, res) => {
  const participants = await encountersService.setInitiative(
    req.userId!,
    req.params.id,
    req.body as BulkInitiativePayload,
  );
  res.json({ status: "ok", participants });
}));

router.post<{ id: string }>("/:id/participants", authMiddleware, asyncHandler(async (req, res) => {
  const participant = await encountersService.addParticipant(
    req.userId!,
    req.params.id,
    req.body as CreateParticipantPayload,
  );
  res.json({ status: "ok", participant });
}));

router.post<{ id: string }>("/:id/participants/bulk", authMiddleware, asyncHandler(async (req, res) => {
  const participants = await encountersService.addParticipants(
    req.userId!,
    req.params.id,
    req.body as BulkCreateParticipantsPayload,
  );
  res.json({ status: "ok", participants });
}));

router.patch<{ id: string; pid: string }>("/:id/participants/:pid", authMiddleware, asyncHandler(async (req, res) => {
  const participant = await encountersService.updateParticipant(
    req.userId!,
    req.params.id,
    req.params.pid,
    req.body as UpdateParticipantPayload,
  );
  res.json({ status: "ok", participant });
}));

router.delete<{ id: string }>("/:id/participants", authMiddleware, asyncHandler(async (req, res) => {
  const ids = req.query.ids as string | undefined;
  const deletedIds = await encountersService.removeParticipants(req.userId!, req.params.id, ids);
  res.json({ status: "ok", message: "Participants deleted", deletedIds });
}));

router.delete<{ id: string; pid: string }>("/:id/participants/:pid", authMiddleware, asyncHandler(async (req, res) => {
  await encountersService.removeParticipant(req.userId!, req.params.id, req.params.pid);
  res.json({ status: "ok", message: "Participant deleted" });
}));

export default router;
