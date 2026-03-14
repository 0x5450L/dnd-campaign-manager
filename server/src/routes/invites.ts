import { addClient, notifyClient, removeClient } from "../services/sseClients";
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

    const existingInvite = await prisma.campaignInvite.findFirst({
      where: {
        email,
        campaignId,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      res.json({ status: 'ok', message: 'Invite already exists', response: { token: existingInvite.token, expiresAt: existingInvite.expiresAt } });
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

    if (email) {
      notifyClient(email, { type: 'invite_created', invite: { token, expiresAt } });
    }

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Invite creation failed', error: error.message });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found', error: 'User not found' });
      return;
    }

    const invites = await prisma.campaignInvite.findMany({
      where: {
        email: user.email,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      include: {
        campaign: {
          include: {
            dm: { select: { displayName: true } },
          },
        },
      },
    });

    res.json({ status: 'ok', message: `You have ${invites.length || 'no'} invites`, invites });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Invites retrieval failed', error: error.message });
  }
});

router.get('/stream', authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) {
    res.status(404).json({ status: 'error', message: 'User not found', error: 'User not found' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write(`\n`)

  addClient(user.email, res);

  req.on('close', () => {
    removeClient(user.email, res);
  });

});


router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await prisma.campaignInvite.findUnique({
      where: { token },
      include: { campaign: { include: { dm: { select: { displayName: true } } } } }
    });

    if (!invite) {
      res.status(404).json({ status: 'error', message: 'Invite not found', error: 'Invite not found' });
      return;
    }

    res.json({ status: 'ok', message: 'Invite retrieved successfully', invite });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Invite retrieval failed', error: error.message });
  }
});

router.post('/:token/respond', authMiddleware, async (req, res) => {
  try {

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    }

    const { token } = req.params as { token: string };
    const { action } = req.body as { action: 'accept' | 'reject' };
    const invite = await prisma.campaignInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      res.status(404).json({ status: 'error', message: 'Invite not found', error: 'Invite not found' });
      return;
    }

    if (invite.expiresAt < new Date()) {
      res.status(400).json({ status: 'error', message: 'Invite expired', error: 'Invite expired' });
      return;
    }

    if (invite.status !== 'pending') {
      res.status(400).json({ status: 'error', message: 'Invite already responded', error: 'Invite already responded' });
      return;
    }

    const existingMember = await prisma.campaignMember.findUnique({
      where: { userId_campaignId: { userId, campaignId: invite.campaignId } },
    });

    if (existingMember) {
      res.status(400).json({ status: 'error', message: 'You are already a member of this campaign', error: 'You are already a member of this campaign' });
      return;
    }

    switch (action) {
      case 'accept':
        await prisma.campaignMember.create({
          data: {
            userId,
            campaignId: invite.campaignId,
            role: 'PLAYER',
          },
        });

        if (invite.email) {
          await prisma.campaignInvite.delete({
            where: { token },
          });
        }

        break;

      case 'reject':
        await prisma.campaignInvite.delete({
          where: { token },
        });
        break;

      default:
        res.status(400).json({ status: 'error', message: 'Invalid action', error: 'Invalid action' });
        return;
    }

    res.json({ status: 'ok', message: `Invite ${action}ed successfully` });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Invite response failed', error: error.message });
  }
});

export default router;