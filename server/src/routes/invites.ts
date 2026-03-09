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

    const { email, campaignId } = req.body;

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
        members: {
          some: {
            userId,
          },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ status: 'error', message: 'Campaign not found', error: 'To invite to a campaign you must participate in it' });
      return;
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);//1week
    const token = crypto.randomUUID();
    await prisma.campaignInvite.create({
      data: {
        email,
        token,
        campaignId,
        expiresAt,
      },
    });

    res.json({ status: 'ok', message: `Invite created successfully. Valid for 1 week.`, response: { token, expiresAt } });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Invite creation failed', error: error.message });
  }
});

export default router;