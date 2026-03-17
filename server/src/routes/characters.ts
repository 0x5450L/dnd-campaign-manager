import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { notifyClient } from "../services/sseClients";

const router = Router();

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    }

    const { name, type, level, race, characterClass, campaignId } = req.body;
    if (!name || !type || !race || !characterClass || !campaignId) {
      res.status(400).json({ status: 'error', message: 'Provide all necessary character details', error: 'Provide all necessary character details' });
      return;
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

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { members: { include: { user: { select: { email: true } } } } },
    });

    campaign?.members.forEach(member => {
      notifyClient(member.user.email, { type: 'character_created', characterId: character.id });
    });

  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Character creation failed', error: error.message });
  }
});

router.get('/campaign-characters/:campaignId', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    }

    const campaignId = req.params.campaignId as string;
    if (!campaignId) {
      res.status(400).json({ status: 'error', message: 'Campaign ID is required', error: 'Campaign ID is required' });
      return;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { members: { include: { user: { select: { email: true } } } } },
    });

    if (!campaign || !campaign.members.some(member => member.userId === userId)) {
      res.status(404).json({ status: 'error', message: 'Campaign not found', error: 'Campaign not found' });
      return;
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

    if (!characters) {
      res.status(404).json({ status: 'error', message: 'Characters not found', error: 'Characters not found' });
      return;
    }
    res.json({ status: 'ok', message: 'Characters retrieved successfully', characters });
  } catch (error: any) {
    switch (error.code) {
      case 'P2025':
        res.status(404).json({ status: 'error', message: 'Characters not found', error: error.message });
        break;
      default:
        res.status(500).json({ status: 'error', message: 'Characters retrieval failed', error: error.message });
        break;
    }
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    }

    const { name, type, level, race, characterClass } = req.body;

    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ status: 'error', message: 'Character ID is required', error: 'Character ID is required' });
      return;
    }

    const currentCharacter = await prisma.character.findUnique({
      where: { id },
    });
    if (!currentCharacter) {
      res.status(404).json({ status: 'error', message: 'Character not found', error: 'Character not found' });
      return;
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

    const campaign = await prisma.campaign.findUnique({
      where: { id: character.campaignId },
      include: { members: { include: { user: { select: { email: true } } } } },
    });
    campaign?.members.forEach(member => {
      notifyClient(member.user.email, { type: 'character_updated', characterId: character.id });
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Character update failed', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    };

    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ status: 'error', message: 'Character ID is required', error: 'Character ID is required' });
      return;
    };

    const character = await prisma.character.delete({
      where: { id },
    });

    res.json({ status: 'ok', message: 'You have lost your friend...', character });

    const campaign = await prisma.campaign.findUnique({
      where: { id: character.campaignId },
      include: { members: { include: { user: { select: { email: true } } } } },
    });

    campaign?.members.forEach(member => {
      notifyClient(member.user.email, { type: 'character_deleted', characterId: id });
    });

  } catch (error: any) {
    switch (error.code) {
      case 'P2025':
        res.status(404).json({ status: 'error', message: 'Character not found', error: error.message });
        break;
      default:
        res.status(500).json({ status: 'error', message: 'Character deletion failed', error: error.message });
        break;
    }
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized', error: 'Unauthorized' });
      return;
    }

    const id = req.params.id as string;

    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      res.status(404).json({ status: 'error', message: 'Character not found', error: 'Character not found' });
      return;
    }
    res.json({ status: 'ok', message: 'Character retrieved successfully', character });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Character retrieval failed', error: error.message });
  }
});

export default router;