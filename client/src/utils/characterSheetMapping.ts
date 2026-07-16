import { ABILITY_NAMES, SKILL_DEFINITIONS } from "@shared/constants/dnd";
import { MIN_ATTACKS, createInitialCharacterSheet, createInitialCreatureSheet } from "../constants/characterSheet";
import { getLevelFromXp } from "./dndMath";
import type {
  CharacterAbilityDTO,
  CharacterAttackInput,
  CharacterDTO,
  CharacterSkillDTO,
  CharacterType,
  CreateCharacterPayload,
  CreatureProfileInput,
  UpdateCharacterPayload,
} from "../types/characters/characters";
import type {
  AbilityName,
  AbilityState,
  Attack,
  CharacterSheetState,
  CreatureSheetState,
  SheetKind,
  SheetState,
  SkillDef,
} from "../types/characters/characterSheet";

export const sheetKindFromCharacterType = (type: CharacterType): SheetKind =>
  type === "monster" ? "creature" : "character";

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

const dtoToSharedFields = (dto: CharacterDTO) => ({
  name: dto.name,
  race: dto.race,
  size: dto.size ?? "Medium",
  level: getLevelFromXp(dto.experience),

  abilities: buildAbilitiesFromDto(dto.abilityScores),
  skills: buildSkillsFromDto(dto.skills),

  ac: dto.armorClass,
  usesShield: dto.usesShield,
  speed: dto.speed,
  currentHp: dto.currentHp,
  maxHp: dto.maxHp,
  tempHp: dto.tempHp,

  attacks: buildAttacksFromDto(dto.attacks),

  senses: dto.senses ?? "",
  languages: dto.languages ?? "",
  damageVulnerabilities: dto.damageVulnerabilities ?? "",
  damageResistances: dto.damageResistances ?? "",
  damageImmunities: dto.damageImmunities ?? "",
  conditionImmunities: dto.conditionImmunities ?? "",

  notes: dto.notes ?? "",

  specialAbilities: dto.abilities ?? [],
  resources: dto.resources ?? [],
});

const dtoToCharacterSheetState = (dto: CharacterDTO): CharacterSheetState => ({
  ...createInitialCharacterSheet(),
  ...dtoToSharedFields(dto),

  characterClass: dto.characterClass,
  background: dto.background,
  xp: dto.experience,

  hitDiceType: dto.hitDiceType,
  hitDiceUsed: dto.hitDiceUsed,
  deathSaveSuccesses: dto.deathSaveSuccesses,
  deathSaveFailures: dto.deathSaveFailures,
  inspiration: dto.inspiration,

  spellSlots: dto.spellSlots ?? null,
});

const dtoToCreatureSheetState = (dto: CharacterDTO): CreatureSheetState => ({
  ...createInitialCreatureSheet(),
  ...dtoToSharedFields(dto),

  challengeRating: dto.creatureProfile?.challengeRating ?? null,
});

export const dtoToSheetState = (dto: CharacterDTO): SheetState =>
  sheetKindFromCharacterType(dto.type) === "creature"
    ? dtoToCreatureSheetState(dto)
    : dtoToCharacterSheetState(dto);

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
  state: SheetState,
  campaignId: string,
  type: CharacterType = "player",
): CreateCharacterPayload => ({
  name: state.name,
  type,
  race: state.race,
  characterClass: state.kind === "character" ? state.characterClass : "",
  campaignId,
  background: state.kind === "character" ? state.background : "",
  notes: state.notes || null,
});

const sheetStateToCreatureProfile = (
  state: CreatureSheetState,
): CreatureProfileInput => ({
  challengeRating: state.challengeRating,
});

export const sheetStateToUpdatePayload = (
  state: SheetState,
): UpdateCharacterPayload => ({
  name: state.name,
  race: state.race,
  notes: state.notes || null,
  speed: state.speed,
  maxHp: state.maxHp,
  currentHp: state.currentHp,
  tempHp: state.tempHp,
  armorClass: state.ac,
  usesShield: state.usesShield,
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
  abilities: state.specialAbilities.filter((ability) => ability.name.trim() !== ""),
  resources: state.resources,
  ...(state.kind === "character"
    ? {
        characterClass: state.characterClass,
        background: state.background,
        experience: state.xp,
        hitDiceType: state.hitDiceType,
        hitDiceUsed: state.hitDiceUsed,
        deathSaveSuccesses: state.deathSaveSuccesses,
        deathSaveFailures: state.deathSaveFailures,
        inspiration: state.inspiration,
        spellSlots: state.spellSlots,
      }
    : {
        creatureProfile: sheetStateToCreatureProfile(state),
      }),
});
