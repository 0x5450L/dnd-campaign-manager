import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

const router = Router();

router.post('/create', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { name, description, setting, imageUrl } = req.body;

  if (!name) {
    throw new AppError(400, 'Campaign name is required');
  }

  const { id, dm } = await prisma.$transaction(async (tx) => {
    const { id } = await tx.campaign.create({
      data: {
        dmId: userId,
        name,
        description,
        setting,
        imageUrl,
      },
    });

    const dm = await tx.campaignMember.create({
      data: {
        userId,
        campaignId: id,
        role: 'DM',
      },
    });

    return { id, dm };
  });

  res.json({ status: 'ok', message: 'Campaign created successfully', campaign: { id, dm, name, description, setting, imageUrl } });
}));

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const campaigns = await prisma.campaign.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      dm: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  res.json({ status: 'ok', message: campaigns.length <= 0 ? 'You have no campaigns. Create one!' : 'Campaigns retrieved successfully', campaigns });
}));

router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const campaignId = req.params.id as string;

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      dm: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new AppError(404, 'Campaign not found');
  }

  res.json({ status: 'ok', message: 'Campaign retrieved successfully', campaign });
}));

router.delete('/delete/:id', authMiddleware, asyncHandler(async (req, res) => {
  const campaignId = req.params.id as string;
  const userId = req.userId!;

  await prisma.$transaction(async (tx) => {
    await tx.campaignMember.deleteMany({ where: { campaignId } });
    await tx.campaign.delete({ where: { dmId: userId, id: campaignId } });
  });

  res.json({ status: 'ok', message: 'Campaign deleted successfully' });
}));

router.patch('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const campaignId = req.params.id as string;
  const { name, description, setting, imageUrl } = req.body;

  const updatedCampaign = await prisma.campaign.update({
    where: { id: campaignId, dmId: userId },
    data: {
      ...(name?.trim() && { name: name.trim() }),
      ...(description !== undefined && { description }),
      ...(setting !== undefined && { setting }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
  });

  res.json({ status: 'ok', message: 'Campaign updated successfully', campaign: updatedCampaign });
}));

export default router;
