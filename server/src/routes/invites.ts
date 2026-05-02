import { addClient, notifyClient, removeClient } from "../services/sseClients";
import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

const router = Router();

router.post('/create', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

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
    throw new AppError(404, 'Campaign not found. To invite to a campaign you must participate in it');
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
}));

router.get('/my', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
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
}));

// SSE stream — не оборачиваем в asyncHandler
router.get('/stream', authMiddleware, async (req, res) => {
  const userId = req.userId!;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) {
    res.status(404).json({ status: 'error', message: 'User not found' });
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

router.get('/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const invite = await prisma.campaignInvite.findUnique({
    where: { token },
    include: { campaign: { include: { dm: { select: { displayName: true } } } } }
  });

  if (!invite) {
    throw new AppError(404, 'Invite not found');
  }

  res.json({ status: 'ok', message: 'Invite retrieved successfully', invite });
}));

router.post('/:token/respond', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const { token } = req.params as { token: string };
  const { action } = req.body as { action: 'accept' | 'reject' };
  const invite = await prisma.campaignInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    throw new AppError(404, 'Invite not found');
  }

  if (invite.expiresAt < new Date()) {
    throw new AppError(400, 'Invite expired');
  }

  if (invite.status !== 'pending') {
    throw new AppError(400, 'Invite already responded');
  }

  const existingMember = await prisma.campaignMember.findUnique({
    where: { userId_campaignId: { userId, campaignId: invite.campaignId } },
  });

  if (existingMember) {
    throw new AppError(400, 'You are already a member of this campaign');
  }

  switch (action) {
    case 'accept':
      await prisma.campaignMember.create({
        data: {
          userId,
          campaignId: invite.campaignId,
          role: 'player',
        },
      });

      if (invite.email) {
        await prisma.campaignInvite.delete({
          where: { token },
        });
      }

      const members = await prisma.campaignMember.findMany({
        where: { campaignId: invite.campaignId },
        include: { user: { select: { email: true } } },
      });

      members.forEach(member => {
        notifyClient(member.user.email, { type: 'member_joined', campaignId: invite.campaignId });
      });

      break;

    case 'reject':
      await prisma.campaignInvite.delete({
        where: { token },
      });
      break;

    default:
      throw new AppError(400, 'Invalid action');
  }

  res.json({ status: 'ok', message: `Invite ${action}ed successfully` });
}));

export default router;
