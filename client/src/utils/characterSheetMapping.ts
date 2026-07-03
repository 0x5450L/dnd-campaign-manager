import { ABILITY_NAMES, SKILL_DEFINITIONS } from "../../../shared/constants/dnd";
import { MIN_ATTACKS } from "../constants/characterSheet";
import { getLevelFromXp } from "./dndMath";
import type {
  CharacterAbilityDTO,
  CharacterAttackInput,
  CharacterDTO,
  CharacterSkillDTO,
  CharacterType,
  CreateCharacterPayload,
  CreatureProfileInput,
  CreatureTraitInput,
  UpdateCharacterPayload,
} from "../types/characters/characters";
import type {
  AbilityName,
  AbilityState,
  Attack,
  CharacterSheetState,
  CreatureTrait,
  SkillDef,
} from "../types/characters/characterSheet";

const makeEmptyAttack = (): Attack => ({
  id: crypto.randomUUID(),
  name: "",
  attackBonus: "",
  damage: "",
  notes: "",
});

const buildAbilitiesFromDto = (
  abilityScores: CharacterAbilityDTO[],
): Record<AbilityName, AbilityState> => {
  const result = {} as Record<AbilityName, AbilityState>;
  for (const ability of ABILITY_NAMES) {
    const found = abilityScores.find((a) => a.name === ability);
    result[ability] = {
      score: found?.score ?? 10,
      saveProficient: found?.saveThrowProficient ?? false,
    };
  }
  return result;
};

const buildSkillsFromDto = (skills: CharacterSkillDTO[]): SkillDef[] =>
  SKILL_DEFINITIONS.map((def) => {
    const found = skills.find((s) => s.name === def.name);
    return {
      name: def.name,
      ability: def.ability,
      proficient: found?.proficient ?? false,
    };
  });

const buildAttacksFromDto = (attacks: CharacterDTO["attacks"]): Attack[] => {
  const mapped: Attack[] = attacks.map((a) => ({
    id: a.id,
    name: a.name,
    attackBonus: String(a.attackBonus),
    damage: a.damage,
    notes: a.notes ?? "",
  }));
  while (mapped.length < MIN_ATTACKS) {
    mapped.push(makeEmptyAttack());
  }
  return mapped;
};

export const dtoToSheetState = (
  dto: CharacterDTO,
): Partial<CharacterSheetState> => ({
  name: dto.name,
  race: dto.race,
  characterClass: dto.characterClass,
  background: dto.background,
  level: getLevelFromXp(dto.experience),
  xp: dto.experience,

  abilities: buildAbilitiesFromDto(dto.abilityScores),
  skills: buildSkillsFromDto(dto.skills),

  ac: dto.armorClass,
  usesShield: dto.usesShield,
  speed: dto.speed,
  currentHp: dto.currentHp,
  maxHp: dto.maxHp,
  tempHp: dto.tempHp,
  hitDiceType: dto.hitDiceType,
  hitDiceUsed: dto.hitDiceUsed,
  deathSaveSuccesses: dto.deathSaveSuccesses,
  deathSaveFailures: dto.deathSaveFailures,
  inspiration: dto.inspiration,

  attacks: buildAttacksFromDto(dto.attacks),
  spellSlots: dto.spellSlots ?? null,

  size: dto.size ?? "Medium",
  senses: dto.senses ?? "",
  languages: dto.languages ?? "",
  damageVulnerabilities: dto.damageVulnerabilities ?? "",
  damageResistances: dto.damageResistances ?? "",
  damageImmunities: dto.damageImmunities ?? "",
  conditionImmunities: dto.conditionImmunities ?? "",
  challengeRating: dto.creatureProfile?.challengeRating ?? null,
  traits: (dto.creatureProfile?.traits ?? []).map((t) => ({
    id: t.id,
    kind: t.kind,
    name: t.name,
    description: t.description,
  })),

  notes: dto.notes ?? "",
});

const sheetAttacksToInputs = (attacks: Attack[]): CharacterAttackInput[] =>
  attacks
    .filter((a) => a.name.trim() !== "")
    .map((a) => ({
      name: a.name,
      damage: a.damage,
      attackBonus: Number.parseInt(a.attackBonus, 10) || 0,
      notes: a.notes.trim() === "" ? null : a.notes,
    }));

const sheetAbilitiesToDtos = (
  abilities: Record<AbilityName, AbilityState>,
): CharacterAbilityDTO[] =>
  ABILITY_NAMES.map((ability) => ({
    name: ability,
    score: abilities[ability].score,
    saveThrowProficient: abilities[ability].saveProficient,
  }));

const sheetSkillsToDtos = (skills: SkillDef[]): CharacterSkillDTO[] =>
  skills.map((s) => ({ name: s.name, proficient: s.proficient }));

export const sheetStateToCreatePayload = (
  state: CharacterSheetState,
  campaignId: string,
  type: CharacterType = "player",
): CreateCharacterPayload => ({
  name: state.name,
  type,
  race: state.race,
  characterClass: state.characterClass,
  campaignId,
  background: state.background,
  notes: state.notes || null,
});

const sheetTraitsToInputs = (traits: CreatureTrait[]): CreatureTraitInput[] =>
  traits
    .filter((t) => t.name.trim() !== "")
    .map((t) => ({ kind: t.kind, name: t.name, description: t.description }));

const sheetStateToCreatureProfile = (
  state: CharacterSheetState,
): CreatureProfileInput => ({
  challengeRating: state.challengeRating,
  traits: sheetTraitsToInputs(state.traits),
});

export const sheetStateToUpdatePayload = (
  state: CharacterSheetState,
  type: CharacterType,
): UpdateCharacterPayload => ({
  name: state.name,
  race: state.race,
  characterClass: state.characterClass,
  background: state.background,
  notes: state.notes || null,
  experience: state.xp,
  speed: state.speed,
  hitDiceType: state.hitDiceType,
  hitDiceUsed: state.hitDiceUsed,
  maxHp: state.maxHp,
  currentHp: state.currentHp,
  tempHp: state.tempHp,
  deathSaveSuccesses: state.deathSaveSuccesses,
  deathSaveFailures: state.deathSaveFailures,
  armorClass: state.ac,
  usesShield: state.usesShield,
  inspiration: state.inspiration,
  size: state.size || null,
  senses: state.senses || null,
  languages: state.languages || null,
  damageVulnerabilities: state.damageVulnerabilities || null,
  damageResistances: state.damageResistances || null,
  damageImmunities: state.damageImmunities || null,
  conditionImmunities: state.conditionImmunities || null,
  abilityScores: sheetAbilitiesToDtos(state.abilities),
  skills: sheetSkillsToDtos(state.skills),
  attacks: sheetAttacksToInputs(state.attacks),
  spellSlots: state.spellSlots,
  ...(type === "monster" && {
    creatureProfile: sheetStateToCreatureProfile(state),
  }),
});
