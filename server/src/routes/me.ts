import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth/authService";

const router = Router();

router.get("", authMiddleware, asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.userId!);
  res.json({ status: "ok", message: "User information", user });
}));

export default router;
