import { ABILITY_NAMES } from "@shared/constants/dnd";
import type { AbilityName, SpellSlotLevel } from "@shared/types/dnd";
import type { SrdCreature } from "@shared/dto/srd";
import { calcModifier } from "@/utils/dndMath";

export type SpellcastingSpellGroup =
  | { kind: "cantrip"; spells: string[] }
  | { kind: "slot"; level: number; total: number; spells: string[] }
  | { kind: "atWill"; spells: string[] }
  | { kind: "perDay"; max: number; spells: string[] };

export type ParsedSpellcastingTrait = {
  header: string;
  spellAbility: AbilityName | null;
  saveDc: number | null;
  spellAttackBonus: number | null;
  groups: SpellcastingSpellGroup[];
};

const CANTRIP_LINE = /^cantrips?\s*\(at will\):\s*(.+)$/i;
const SLOT_LINE = /^(\d+)(?:st|nd|rd|th)?[\s-]*level\s*\((\d+)\s*slots?\):\s*(.+)$/i;
const AT_WILL_LINE = /^at will:\s*(.+)$/i;
const PER_DAY_LINE = /^(\d+)\s*\/\s*day(?:\s+each)?:\s*(.+)$/i;
const SPELL_ABILITY = /spellcasting ability is (\w+)/i;
const SAVE_DC = /spell save DC (\d+)/i;
const SPELL_ATTACK = /([+-]\d+) to hit/i;
const TRAILING_LIST_INTRO = /[^.!?]*:\s*$/;
const SPELLCASTING_NAME = /spellcasting/i;

const LINE_BREAKS =
  /\n+|\s\*\s+|(?=\bAt will:)|(?=\b\d+\s*\/\s*day(?:\s+each)?:)|(?=\bCantrips?\s*\(at will\):)|(?=\b\d+(?:st|nd|rd|th)?[\s-]*level\s*\(\d+\s*slots?\):)/i;

const splitLines = (description: string): string[] =>
  description
    .split(LINE_BREAKS)
    .map((line) => line.replace(/^\*\s*/, "").trim())
    .filter((line) => line.length > 0);

const splitSpells = (list: string): string[] =>
  list
    .split(",")
    .map((spell) => spell.replace(/\*+\s*$/, "").replace(/\.\s*$/, "").trim())
    .filter((spell) => spell.length > 0);

const toAbilityName = (word: string): AbilityName | null => {
  const short = word.slice(0, 3).toLowerCase();
  const match = ABILITY_NAMES.find((name) => name === short);
  return match ?? null;
};

const parseLine = (line: string): SpellcastingSpellGroup | null => {
  const cantrip = line.match(CANTRIP_LINE);
  if (cantrip) return { kind: "cantrip", spells: splitSpells(cantrip[1]) };
  const slot = line.match(SLOT_LINE);
  if (slot) {
    return {
      kind: "slot",
      level: Number(slot[1]),
      total: Number(slot[2]),
      spells: splitSpells(slot[3]),
    };
  }
  const atWill = line.match(AT_WILL_LINE);
  if (atWill) return { kind: "atWill", spells: splitSpells(atWill[1]) };
  const perDay = line.match(PER_DAY_LINE);
  if (perDay) return { kind: "perDay", max: Number(perDay[1]), spells: splitSpells(perDay[2]) };
  return null;
};

export const isSpellcastingTraitName = (name: string): boolean =>
  SPELLCASTING_NAME.test(name);

export const parseSpellcastingTrait = (
  description: string,
): ParsedSpellcastingTrait | null => {
  const lines = splitLines(description);
  const headerLines: string[] = [];
  const groups: SpellcastingSpellGroup[] = [];

  for (const line of lines) {
    const group = parseLine(line);
    if (group) {
      groups.push(group);
    } else if (groups.length === 0) {
      headerLines.push(line);
    }
  }

  if (groups.length === 0) return null;

  const header = headerLines.join(" ").replace(TRAILING_LIST_INTRO, "").trim();
  const ability = header.match(SPELL_ABILITY);
  const dc = header.match(SAVE_DC);
  const attack = header.match(SPELL_ATTACK);

  return {
    header,
    spellAbility: ability ? toAbilityName(ability[1]) : null,
    saveDc: dc ? Number(dc[1]) : null,
    spellAttackBonus: attack ? Number(attack[1]) : null,
    groups,
  };
};

export type SpellcastingSeed = {
  spellSlots: SpellSlotLevel[];
  spellAbility: AbilityName | null;
  proficiencyBonus: number | null;
};

const deriveProficiencyBonus = (
  creature: SrdCreature,
  parsed: ParsedSpellcastingTrait,
): number | null => {
  if (!parsed.spellAbility) return null;
  const mod = calcModifier(creature.abilities[parsed.spellAbility]);
  const fromDc = parsed.saveDc !== null ? parsed.saveDc - 8 - mod : null;
  const fromAttack =
    parsed.spellAttackBonus !== null ? parsed.spellAttackBonus - mod : null;
  const derived = fromDc ?? fromAttack;
  return derived !== null && derived >= 2 ? derived : null;
};

export const creatureSpellcastingSeed = (
  creature: SrdCreature,
): SpellcastingSeed | null => {
  const parsedTraits = creature.specialAbilities
    .filter((trait) => isSpellcastingTraitName(trait.name))
    .map((trait) => parseSpellcastingTrait(trait.description))
    .filter((parsed): parsed is ParsedSpellcastingTrait => parsed !== null);

  if (parsedTraits.length === 0) return null;

  const slots = new Map<number, SpellSlotLevel>();
  for (const parsed of parsedTraits) {
    for (const group of parsed.groups) {
      if (group.kind !== "slot") continue;
      slots.set(group.level, { level: group.level, total: group.total, used: 0 });
    }
  }

  const statsSource =
    parsedTraits.find((parsed) => parsed.spellAbility !== null) ?? parsedTraits[0];

  return {
    spellSlots: [...slots.values()].sort((a, b) => a.level - b.level),
    spellAbility: statsSource.spellAbility,
    proficiencyBonus: deriveProficiencyBonus(creature, statsSource),
  };
};
