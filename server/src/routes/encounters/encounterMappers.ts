import { Encounter, EncounterParticipant } from "@prisma/client";
import type {
  EncounterDTO,
  EncounterParticipantDTO,
  ParticipantAbilityScore,
  SpellSlotLevel,
} from "../../../../shared/session";
import type { AbilityName } from "../../../../shared/dnd";
import type { CharacterAttackDTO } from "../../../../shared/character";
import { jsonInput } from "../../utils/payload";

export { jsonInput };

export const mapParticipantToDTO = (
  participant: EncounterParticipant,
): EncounterParticipantDTO => ({
  id: participant.id,
  encounterId: participant.encounterId,
  characterId: participant.characterId,
  name: participant.name,
  type: participant.type,
  sortOrder: participant.sortOrder,
  maxHp: participant.maxHp,
  currentHp: participant.currentHp,
  tempHp: participant.tempHp,
  armorClass: participant.armorClass,
  attacks: participant.attacks as unknown as CharacterAttackDTO[] | [],
  conditions: participant.conditions,
  isVisible: participant.isVisible,
  acHidden: participant.acHidden,
  typeHidden: participant.typeHidden,
  abilityScores: participant.abilityScores as unknown as ParticipantAbilityScore[] | null,
  spellAbility: participant.spellAbility as AbilityName | null,
  proficiencyBonus: participant.proficiencyBonus,
  spellSlots: participant.spellSlots as unknown as SpellSlotLevel[] | null,
  deathSaveSuccesses: participant.deathSaveSuccesses,
  deathSaveFailures: participant.deathSaveFailures,
  createdAt: participant.createdAt.toISOString(),
  updatedAt: participant.updatedAt.toISOString(),
});

export const mapEncounterToDTO = (encounter: Encounter): EncounterDTO => ({
  id: encounter.id,
  name: encounter.name,
  status: encounter.status,
  round: encounter.round,
  currentTurnIndex: encounter.currentTurnIndex,
  campaignSessionId: encounter.campaignSessionId,
  startedAt: encounter.startedAt.toISOString(),
  updatedAt: encounter.updatedAt.toISOString(),
  endedAt: encounter.endedAt ? encounter.endedAt.toISOString() : null,
});
