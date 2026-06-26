import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import * as campaignsService from "../services/campaigns/campaignsService";

const router = Router();

router.post("/create", authMiddleware, asyncHandler(async (req, res) => {
  const campaign = await campaignsService.createCampaign(req.userId!, req.body);
  res.json({ status: "ok", message: "Campaign created successfully", campaign });
}));

router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const campaigns = await campaignsService.listCampaigns(req.userId!);
  res.json({
    status: "ok",
    message:
      campaigns.length <= 0
        ? "You have no campaigns. Create one!"
        : "Campaigns retrieved successfully",
    campaigns,
  });
}));

router.get<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const campaign = await campaignsService.getCampaign(req.userId!, req.params.id);
  res.json({ status: "ok", message: "Campaign retrieved successfully", campaign });
}));

router.delete<{ id: string }>("/delete/:id", authMiddleware, asyncHandler(async (req, res) => {
  await campaignsService.deleteCampaign(req.userId!, req.params.id);
  res.json({ status: "ok", message: "Campaign deleted successfully" });
}));

router.patch<{ id: string }>("/:id", authMiddleware, asyncHandler(async (req, res) => {
  const campaign = await campaignsService.updateCampaign(req.userId!, req.params.id, req.body);
  res.json({ status: "ok", message: "Campaign updated successfully", campaign });
}));

router.post<{ id: string }>("/:id/leave", authMiddleware, asyncHandler(async (req, res) => {
  await campaignsService.leaveCampaign(req.userId!, req.params.id);
  res.json({ status: "ok", message: "You left the campaign", campaignId: req.params.id, userId: req.userId! });
}));

router.delete<{ id: string; userId: string }>(
  "/:id/members/:userId",
  authMiddleware,
  asyncHandler(async (req, res) => {
    await campaignsService.removeMember(req.userId!, req.params.id, req.params.userId);
    res.json({ status: "ok", message: "Member removed", campaignId: req.params.id, userId: req.params.userId });
  }),
);

export default router;
