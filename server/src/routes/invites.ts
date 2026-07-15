import { Router } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validateBody";
import {
  createInviteSchema,
  respondToInviteSchema,
  type CreateInviteBody,
  type RespondToInviteBody,
} from "../validation/invites";
import { openSseStream } from "../services/sseClients";
import * as invitesService from "../services/invites/invitesService";

const router = Router();

router.post("/create", authMiddleware, validateBody(createInviteSchema), asyncHandler<ParamsDictionary, unknown, CreateInviteBody>(async (req, res) => {
  const { email, campaignId } = req.body;
  const result = await invitesService.createInvite(req.userId!, email, campaignId);
  res.json({
    status: "ok",
    message: result.alreadyExisted
      ? "Invite already exists"
      : "Invite created successfully. Valid for 1 week.",
    response: { token: result.token, expiresAt: result.expiresAt },
  });
}));

router.get("/my", authMiddleware, asyncHandler(async (req, res) => {
  const invites = await invitesService.listMyInvites(req.userId!);
  res.json({ status: "ok", message: `You have ${invites.length || "no"} invites`, invites });
}));

router.get("/stream", authMiddleware, async (req, res) => {
  const user = await invitesService.getStreamUser(req.userId!);
  if (!user || !user.email) {
    res.status(404).json({ status: "error", message: "User not found" });
    return;
  }

  openSseStream(req, res, user.email);
});

router.get<{ token: string }>("/:token", asyncHandler(async (req, res) => {
  const invite = await invitesService.getInviteByToken(req.params.token);
  res.json({ status: "ok", message: "Invite retrieved successfully", invite });
}));

router.post<{ token: string }>("/:token/respond", authMiddleware, validateBody(respondToInviteSchema), asyncHandler<{ token: string }, unknown, RespondToInviteBody>(async (req, res) => {
  const { action } = req.body;
  await invitesService.respondToInvite(req.userId!, req.params.token, action);
  res.json({ status: "ok", message: `Invite ${action}ed successfully` });
}));

export default router;
