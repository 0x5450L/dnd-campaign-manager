import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { notifyClient } from "../services/sseClients";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";

const router = Router();

router.post('/create', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: req.body.campaignId,
      members: {
        some: {
          userId,
        },
      },
    },
    include: { members: { include: { user: { select: { email: true } } } } },
  });

  if (!campaign) {
    throw new AppError(404, 'Campaign not found or you are not a member of it');
  }

  const { name, type, level, race, characterClass, campaignId } = req.body;
  if (!name || !type || !race || !characterClass || !campaignId) {
    throw new AppError(400, 'Provide all necessary character details');
  };

  const character = await prisma.character.create({
    data: {
      name,
      type,
      level,
      race,
      characterClass,
      campaignId,
      userId,
    },
  });

  res.json({ status: 'ok', message: 'Character created successfully', character });

  campaign.members.forEach(member => {
    notifyClient(member.user.email, { type: 'character_created', characterId: character.id });
  });

}));

router.get('/campaign-characters/:campaignId', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const campaignId = req.params.campaignId as string;
  if (!campaignId) {
    throw new AppError(400, 'Campaign ID is required');
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { members: { include: { user: { select: { email: true } } } } },
  });

  if (!campaign || !campaign.members.some(member => member.userId === userId)) {
    throw new AppError(404, 'Campaign not found');
  }

  const characters = await prisma.character.findMany({
    where: { campaignId },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
  });

  res.json({ status: 'ok', message: 'Characters retrieved successfully', characters });
}));

router.patch('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const { name, type, level, race, characterClass } = req.body;

  const id = req.params.id as string;
  if (!id) {
    throw new AppError(400, 'Character ID is required');
  }

  const currentCharacter = await prisma.character.findUnique({
    where: { id },
    include: {
      campaign: {
        select: {
          dmId: true
        },
        include: { members: { include: { user: { select: { email: true } } } } }
      }
    }
  });

  if (!currentCharacter || (currentCharacter.userId !== userId && currentCharacter.campaign.dmId !== userId)) {
    throw new AppError(404, 'Character not found or you are not the owner of it');
  }

  const character = await prisma.character.update({
    where: { id },
    data: {
      name: name || currentCharacter.name,
      type: type || currentCharacter.type,
      level: level || currentCharacter.level,
      race: race || currentCharacter.race,
      characterClass: characterClass || currentCharacter.characterClass,
    },
  });

  res.json({ status: 'ok', message: 'Character updated successfully', character });

  currentCharacter.campaign.members.forEach(member => {
    notifyClient(member.user.email, { type: 'character_updated', characterId: character.id });
  });
}));

router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const id = req.params.id as string;
  if (!id) {
    throw new AppError(400, 'Character ID is required');
  };

  const character = await prisma.character.findUnique({
    where: { id },
    include: {
      campaign: {
        select: {
          dmId: true
        },
        include: { members: { include: { user: { select: { email: true } } } } }
      }
    }
  });

  if (!character || (character.userId !== userId && character.campaign.dmId !== userId)) {
    throw new AppError(404, 'Character not found or you are not the owner of it');
  }

  await prisma.character.delete({
    where: { id },
  });

  res.json({ status: 'ok', message: 'You have lost your friend...', character });

  character.campaign.members.forEach(member => {
    notifyClient(member.user.email, { type: 'character_deleted', characterId: id });
  });

}));

router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const id = req.params.id as string;

  const character = await prisma.character.findUnique({
    where: { id, campaign: { members: { some: { userId } } } },
  });

  if (!character) {
    throw new AppError(404, 'Character not found or you are not a member of the campaign');
  }
  res.json({ status: 'ok', message: 'Character retrieved successfully', character });
}));

export default router;