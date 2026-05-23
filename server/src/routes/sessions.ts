import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import { requireCampaignAccess, requireCampaignDM } from "../utils/accessControl";
import { pickDefined, trimOrNull } from "../utils/payload";
import type { UpdateSessionPayload } from "../../../shared/session";

const router = Router();

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { campaignId, title } = req.body;

  if (!campaignId) {
    throw new AppError(400, 'campaignId is required');
  }

  await requireCampaignDM(userId, campaignId);

  const { _max } = await prisma.campaignSession.aggregate({
    where: { campaignId },
    _max: { number: true },
  });

  const session = await prisma.campaignSession.create({
    data: {
      campaignId,
      number: (_max.number ?? 0) + 1,
      ...(title !== undefined && { title: title.trim() }),
    },
  });

  res.json({ status: 'ok', message: 'Session created successfully', session });
}));

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const campaignId = req.query.campaignId as string | undefined;

  if (!campaignId) {
    throw new AppError(400, 'campaignId query param is required');
  }

  await requireCampaignAccess(userId, campaignId);

  const sessions = await prisma.campaignSession.findMany({
    where: { campaignId },
    orderBy: { number: 'desc' },
  });

  res.json({ status: 'ok', message: 'Sessions retrieved successfully', sessions });
}));

router.get<{ id: string }>('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  const session = await prisma.campaignSession.findUnique({
    where: {
      id,
      campaign: { members: { some: { userId } } },
    },
  });

  if (!session) {
    throw new AppError(404, 'Session not found');
  }

  res.json({ status: 'ok', message: 'Session retrieved successfully', session });
}));

router.patch<{ id: string }>('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { status, title, summary, notes } = req.body as UpdateSessionPayload;

  const existing = await prisma.campaignSession.findUnique({
    where: { id, campaign: { dmId: userId } },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(404, 'Session not found');
  }

  const session = await prisma.campaignSession.update({
    where: { id },
    data: {
      ...pickDefined({
        status,
        title: trimOrNull(title),
        summary: trimOrNull(summary),
        notes: trimOrNull(notes),
      }),
      ...(status === 'ended' && { endedAt: new Date() }),
    },
  });

  res.json({ status: 'ok', message: 'Session updated successfully', session });
}));

router.delete<{ id: string }>('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  const existing = await prisma.campaignSession.findUnique({
    where: { id, campaign: { dmId: userId } },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(404, 'Session not found');
  }

  await prisma.campaignSession.delete({ where: { id } });

  res.json({ status: 'ok', message: 'Session deleted successfully' });
}));

export default router;
