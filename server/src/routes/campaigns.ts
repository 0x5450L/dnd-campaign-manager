import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { Router } from "express";

const router = Router();

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    }
    const { name, description, setting, imageUrl } = req.body;

    if (!name) {
      res.status(400).json({ status: 'error', message: 'Campaign name is required' });
      return;
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

  } catch (error: any) {
    switch (error.code) {
      case 'P2002':
        res.status(409).json({ status: 'error', message: 'Campaign already exists', error: error.message });
        break;
      default:
        res.status(500).json({ status: 'error', message: 'Campaign creation failed', error: error.message });
        break;
    }
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    }

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
        members: true,
      },
    });

    res.json({ status: 'ok', message: campaigns.length <= 0 ? 'You have no campaigns. Create one!' : 'Campaigns retrieved successfully', campaigns });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Campaigns retrieval failed', error: error.message });
  }
});

router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const campaignId = req.params.id as string;
    if (!campaignId) {
      res.status(400).json({ status: 'error', message: 'Campaign ID is required' });
      return;
    }

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.campaignMember.deleteMany({ where: { campaignId } });
      await tx.campaign.delete({ where: { dmId: userId, id: campaignId } });
    });


    res.json({ status: 'ok', message: 'Campaign deleted successfully' });
  } catch (error: any) {
    switch (error.code) {
      case 'P2025':
        res.status(404).json({ status: 'error', message: 'Campaign not found', error: error.message });
        break;
      default:
        res.status(500).json({ status: 'error', message: 'Campaign deletion failed', error: error.message });
        break;
    }
  }
});

export default router;