import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

const router = Router();

router.get('', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json({ status: 'ok', message: 'User information', user: { email: user.email, displayName: user.displayName, id: user.id } });
}));

export default router;
