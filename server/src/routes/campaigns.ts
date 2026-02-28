import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { Router } from "express";

const router = Router();

router.post('/campaigns', authMiddleware, async (req, res) => {
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

export default router;