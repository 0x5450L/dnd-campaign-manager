import type { CharacterDTO } from "@/types/characters/characters";
import type { EncounterParticipantDTO, ParticipantType } from "@/types/encounter";
import { getLevelFromXp, getProficiencyBonus } from "./dndMath";

const participantTypeFromCharacterType = (
  type: CharacterDTO["type"],
): ParticipantType => (type === "monster" ? "monster" : "npc");

export const characterToParticipantDraft = (
  character: CharacterDTO,
): EncounterParticipantDTO => ({
  id: "",
  encounterId: "",
  characterId: null,
  type: participantTypeFromCharacterType(character.type),
  name: character.name,
  sortOrder: 0,
  maxHp: character.maxHp,
  currentHp: character.currentHp,
  tempHp: character.tempHp,
  armorClass: character.armorClass,
  attacks: character.attacks,
  conditions: [],
  isVisible: true,
  acHidden: false,
  typeHidden: false,
  usesShield: character.usesShield,
  abilityScores: character.abilityScores.map(({ name, score }) => ({ name, score })),
  spellAbility: null,
  proficiencyBonus: getProficiencyBonus(getLevelFromXp(character.experience)),
  spellSlots: character.spellSlots ?? null,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  speed: character.speed > 0 ? `${character.speed} ft.` : null,
  senses: character.senses,
  challengeRating: character.creatureProfile?.challengeRating ?? null,
  damageVulnerabilities: character.damageVulnerabilities,
  damageResistances: character.damageResistances,
  damageImmunities: character.damageImmunities,
  conditionImmunities: character.conditionImmunities,
  abilities: character.abilities,
  resources: character.resources,
  createdAt: "",
  updatedAt: "",
});
