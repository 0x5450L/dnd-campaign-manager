import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validateBody";
import { asyncHandler } from "../utils/asyncHandler";
import type {
  AbilityUsagePayload,
  RollInitiativePayload,
  BulkCreateParticipantsPayload,
  BulkInitiativePayload,
  CreateParticipantPayload,
  UpdateEncounterPayload,
  UpdateParticipantPayload,
} from "@shared/dto/session";
import {
  abilityUsageSchema,
  bulkCreateParticipantsSchema,
  bulkInitiativeSchema,
  createEncounterSchema,
  createParticipantSchema,
  listEncountersQuerySchema,
  removeParticipantsQuerySchema,
  rollInitiativeSchema,
  updateEncounterSchema,
  updateParticipantSchema,
  type CreateEncounterBody,
} from "../validation/encounters";
import { parseQuery } from "../validation/parseQuery";
import * as encountersService from "../services/encounters/encountersService";

const router = Router();

router.post("/", authMiddleware, validateBody(createEncounterSchema), asyncHandler<ParamsDictionary, unknown, CreateEncounterBody>(async (req, res) => {
  const { campaignSessionId, name } = req.body;
  const encounter = await encountersService.createEncounter(req.userId!, campaignSessionId, name);
  res.json({ status: "ok", message: "Encounter created", encounter });
}));

router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const { campaignSessionId } = parseQuery(listEncountersQuerySchema, req.query);
  const encounters = await encountersService.listEncounters(req.userId!, campaignSessionId);
  res.json({ status: "ok", encounters });
}));

router.get<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const encounter = await encountersService.getEncounter(req.userId!, req.params.id);
  res.json({ status: "ok", encounter });
}));

router.patch<{ id: string }>("/:id", authMiddleware, validateBody(updateEncounterSchema), asyncHandler<{ id: string }, unknown, UpdateEncounterPayload>(async (req, res) => {
  const encounter = await encountersService.updateEncounter(req.userId!, req.params.id, req.body);
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

router.patch<{ id: string }>("/:id/initiative", authMiddleware, validateBody(bulkInitiativeSchema), asyncHandler<{ id: string }, unknown, BulkInitiativePayload>(async (req, res) => {
  const participants = await encountersService.setInitiative(req.userId!, req.params.id, req.body);
  res.json({ status: "ok", participants });
}));

router.post<{ id: string }>("/:id/initiative/roll", authMiddleware, validateBody(rollInitiativeSchema), asyncHandler<{ id: string }, unknown, RollInitiativePayload>(async (req, res) => {
  const result = await encountersService.rollEncounterInitiative(req.userId!, req.params.id, req.body);
  res.json({ status: "ok", participants: result.participants, rolls: result.rolls });
}));

router.post<{ id: string }>("/:id/participants", authMiddleware, validateBody(createParticipantSchema), asyncHandler<{ id: string }, unknown, CreateParticipantPayload>(async (req, res) => {
  const participant = await encountersService.addParticipant(req.userId!, req.params.id, req.body);
  res.json({ status: "ok", participant });
}));

router.post<{ id: string }>("/:id/participants/bulk", authMiddleware, validateBody(bulkCreateParticipantsSchema), asyncHandler<{ id: string }, unknown, BulkCreateParticipantsPayload>(async (req, res) => {
  const participants = await encountersService.addParticipants(req.userId!, req.params.id, req.body);
  res.json({ status: "ok", participants });
}));

router.patch<{ id: string; pid: string }>("/:id/participants/:pid", authMiddleware, validateBody(updateParticipantSchema), asyncHandler<{ id: string; pid: string }, unknown, UpdateParticipantPayload>(async (req, res) => {
  const participant = await encountersService.updateParticipant(
    req.userId!,
    req.params.id,
    req.params.pid,
    req.body,
  );
  res.json({ status: "ok", participant });
}));

router.post<{ id: string; pid: string; abilityId: string }>("/:id/participants/:pid/abilities/:abilityId/usage", authMiddleware, validateBody(abilityUsageSchema), asyncHandler<{ id: string; pid: string; abilityId: string }, unknown, AbilityUsagePayload>(async (req, res) => {
  const participant = await encountersService.applyParticipantAbilityUsage(
    req.userId!,
    req.params.id,
    req.params.pid,
    req.params.abilityId,
    req.body.action,
  );
  res.json({ status: "ok", participant });
}));

router.delete<{ id: string }>("/:id/participants", authMiddleware, asyncHandler(async (req, res) => {
  const { ids } = parseQuery(removeParticipantsQuerySchema, req.query);
  const deletedIds = await encountersService.removeParticipants(req.userId!, req.params.id, ids);
  res.json({ status: "ok", message: "Participants deleted", deletedIds });
}));

router.delete<{ id: string; pid: string }>("/:id/participants/:pid", authMiddleware, asyncHandler(async (req, res) => {
  await encountersService.removeParticipant(req.userId!, req.params.id, req.params.pid);
  res.json({ status: "ok", message: "Participant deleted" });
}));

export default router;
