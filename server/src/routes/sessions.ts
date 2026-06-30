import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import type { UpdateSessionPayload } from "../../../shared/dto/session";
import * as sessionsService from "../services/sessions/sessionsService";

const router = Router();

router.post("/", authMiddleware, asyncHandler(async (req, res) => {
  const session = await sessionsService.createSession(req.userId!, req.body.campaignId, req.body.title);
  res.json({ status: "ok", message: "Session created successfully", session });
}));

router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const campaignId = req.query.campaignId as string | undefined;
  const sessions = await sessionsService.listSessions(req.userId!, campaignId);
  res.json({ status: "ok", message: "Sessions retrieved successfully", sessions });
}));

router.get<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const session = await sessionsService.getSession(req.userId!, req.params.id);
  res.json({ status: "ok", message: "Session retrieved successfully", session });
}));

router.patch<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const session = await sessionsService.updateSession(
    req.userId!,
    req.params.id,
    req.body as UpdateSessionPayload,
  );
  res.json({ status: "ok", message: "Session updated successfully", session });
}));

router.delete<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  await sessionsService.deleteSession(req.userId!, req.params.id);
  res.json({ status: "ok", message: "Session deleted successfully" });
}));

export default router;
