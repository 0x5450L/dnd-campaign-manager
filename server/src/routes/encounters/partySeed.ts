import prisma from "../../services/prisma";
import { getLevelFromXp, getProficiencyBonus } from "../../../../shared/dndMath";

export const seedPartyForEncounter = async (encounterId: string, campaignId: string) => {
  const characters = await prisma.character.findMany({
    where: { campaignId, type: "player" },
    include: { abilityScores: true, attacks: true },
  });

  if (characters.length === 0) return;

  await prisma.encounterParticipant.createMany({
    data: characters.map((character) => ({
      encounterId,
      characterId: character.id,
      type: "pc" as const,
      name: character.name,
      sortOrder: 0,
      maxHp: character.maxHp,
      currentHp: character.currentHp,
      tempHp: character.tempHp,
      armorClass: character.armorClass,
      usesShield: character.usesShield,
      deathSaveSuccesses: character.deathSaveSuccesses,
      deathSaveFailures: character.deathSaveFailures,
      proficiencyBonus: getProficiencyBonus(getLevelFromXp(character.experience)),
      abilityScores: character.abilityScores.map((a) => ({ name: a.name, score: a.score })),
      attacks: character.attacks.map((a) => ({
        id: a.id,
        name: a.name,
        damage: a.damage,
        attackBonus: a.attackBonus,
        notes: a.notes,
      })),
    })),
  });
};
