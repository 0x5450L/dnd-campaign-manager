import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import prisma from "../services/prisma";
import { notifyClient } from "../services/sseClients";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import {
  ABILITY_NAMES,
  DEFAULT_ABILITY_SCORE,
  SKILL_NAMES,
} from "../constants/dnd";
import type { UpdateCharacterPayload } from "../../../shared/character";

const router = Router();

router.post('/create', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;

  const { name, type, race, characterClass, campaignId, background, alignment, notes } = req.body;
  if (!name || !type || !race || !characterClass || !campaignId) {
    throw new AppError(400, 'Provide all necessary character details');
  }

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
      members: { some: { userId } },
    },
    include: { members: { include: { user: { select: { email: true } } } } },
  });

  if (!campaign) {
    throw new AppError(404, 'Campaign not found or you are not a member of it');
  }

  const character = await prisma.character.create({
    data: {
      name,
      type,
      race,
      characterClass,
      background: background ?? '',
      ...(alignment !== undefined && { alignment }),
      ...(notes !== undefined && { notes }),
      campaignId,
      userId,
      abilityScores: {
        create: ABILITY_NAMES.map((ability) => ({
          name: ability,
          score: DEFAULT_ABILITY_SCORE,
        })),
      },
      skills: {
        create: SKILL_NAMES.map((skillName) => ({
          name: skillName,
        })),
      },
    },
    include: {
      abilityScores: true,
      skills: true,
      attacks: true,
    },
  });

  res.json({ status: 'ok', message: 'Character created successfully', character });

  campaign.members.forEach(member => {
    notifyClient(member.user.email, { type: 'character_created', characterId: character.id });
  });

}));

router.get<{ campaignId: string }>('/campaign-characters/:campaignId', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { campaignId } = req.params;
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

router.patch<{ id: string }>('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  if (!id) {
    throw new AppError(400, 'Character ID is required');
  }

  const currentCharacter = await prisma.character.findUnique({
    where: { id },
    include: {
      campaign: {
        select: { dmId: true },
        include: { members: { include: { user: { select: { email: true } } } } },
      },
    },
  });

  if (!currentCharacter || (currentCharacter.userId !== userId && currentCharacter.campaign.dmId !== userId)) {
    throw new AppError(404, 'Character not found or you are not the owner of it');
  }

  const {
    name, type, race, characterClass, background, alignment, notes, experience,
    speed, hitDiceType, hitDiceUsed, maxHp, currentHp, tempHp,
    deathSaveSuccesses, deathSaveFailures, armorClass, usesShield, inspiration,
    abilityScores, skills, attacks,
  } = req.body as UpdateCharacterPayload;

  const character = await prisma.character.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(race !== undefined && { race }),
      ...(characterClass !== undefined && { characterClass }),
      ...(background !== undefined && { background }),
      ...(alignment !== undefined && { alignment }),
      ...(notes !== undefined && { notes }),
      ...(experience !== undefined && { experience }),
      ...(speed !== undefined && { speed }),
      ...(hitDiceType !== undefined && { hitDiceType }),
      ...(hitDiceUsed !== undefined && { hitDiceUsed }),
      ...(maxHp !== undefined && { maxHp }),
      ...(currentHp !== undefined && { currentHp }),
      ...(tempHp !== undefined && { tempHp }),
      ...(deathSaveSuccesses !== undefined && { deathSaveSuccesses }),
      ...(deathSaveFailures !== undefined && { deathSaveFailures }),
      ...(armorClass !== undefined && { armorClass }),
      ...(usesShield !== undefined && { usesShield }),
      ...(inspiration !== undefined && { inspiration }),

      ...(abilityScores !== undefined && {
        abilityScores: {
          updateMany: abilityScores.map((a) => ({
            where: { name: a.name },
            data: { score: a.score, saveThrowProficient: a.saveThrowProficient },
          })),
        },
      }),

      ...(skills !== undefined && {
        skills: {
          updateMany: skills.map((s) => ({
            where: { name: s.name },
            data: { proficient: s.proficient },
          })),
        },
      }),

      ...(attacks !== undefined && {
        attacks: {
          deleteMany: {},
          create: attacks.map((a) => ({
            name: a.name,
            damage: a.damage,
            attackBonus: a.attackBonus,
            notes: a.notes ?? null,
          })),
        },
      }),
    },
    include: {
      abilityScores: true,
      skills: true,
      attacks: true,
    },
  });

  res.json({ status: 'ok', message: 'Character updated successfully', character });

  currentCharacter.campaign.members.forEach(member => {
    notifyClient(member.user.email, { type: 'character_updated', characterId: character.id });
  });
}));

router.delete<{ id: string }>('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;
  if (!id) {
    throw new AppError(400, 'Character ID is required');
  }

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

router.get<{ id: string }>('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const userId = req.userId!;
  const { id } = req.params;

  const character = await prisma.character.findUnique({
    where: { id, campaign: { members: { some: { userId } } } },
    include: {
      abilityScores: true,
      skills: true,
      attacks: true,
    },
  });

  if (!character) {
    throw new AppError(404, 'Character not found or you are not a member of the campaign');
  }
  res.json({ status: 'ok', message: 'Character retrieved successfully', character });
}));

export default router;