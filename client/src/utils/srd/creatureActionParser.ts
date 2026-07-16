import type { SrdCreatureAction } from "@shared/dto/srd";
import { MIN_ATTACKS } from "@/constants/characterSheet";
import type { Attack } from "@/types/characters/characterSheet";

type ParsedAction = Pick<Attack, "attackBonus" | "damage" | "notes">;

const ABILITY_ABBREVIATION: Record<string, string> = {
  strength: "Str",
  dexterity: "Dex",
  constitution: "Con",
  intelligence: "Int",
  wisdom: "Wis",
  charisma: "Cha",
};

const TO_HIT = /([+-]\d+)\s+to hit/i;
const SAVE = /DC\s+(\d+)\s+(\w+)\s+(?:saving throw|save)/i;
const DAMAGE = /\((\d+d\d+(?:\s*[+-]\s*\d+)?)\)\s+(\w+)\s+damage/i;
const TO_HIT_META = /to hit,\s*(.*?)\.\s*Hit:/i;
const HALF_ON_SAVE = /half as much/i;

export const parseCreatureAction = (description: string): ParsedAction => {
  const text = description.trim();
  const toHit = text.match(TO_HIT);
  const save = text.match(SAVE);
  const damageMatch = text.match(DAMAGE);

  const damage = damageMatch
    ? `${damageMatch[1].replace(/\s+/g, " ")} ${damageMatch[2].toLowerCase()}`
    : "";

  if (toHit) {
    const meta = text.match(TO_HIT_META);
    return { attackBonus: toHit[1], damage, notes: meta ? meta[1].trim() : "" };
  }

  if (save) {
    const ability = ABILITY_ABBREVIATION[save[2].toLowerCase()] ?? save[2];
    const suffix = HALF_ON_SAVE.test(text) ? ", half on success" : "";
    return {
      attackBonus: `DC ${save[1]} ${ability}`,
      damage,
      notes: `${ability} save${suffix}`,
    };
  }

  if (damage) {
    return { attackBonus: "", damage, notes: "" };
  }

  return { attackBonus: "", damage: "", notes: text };
};

const makeEmptyAttack = (): Attack => ({
  id: crypto.randomUUID(),
  name: "",
  attackBonus: "",
  damage: "",
  notes: "",
});

export type CreatureActionsSplit = {
  attacks: Attack[];
  nonAttackActions: SrdCreatureAction[];
};

export const splitCreatureActions = (
  actions: SrdCreatureAction[],
): CreatureActionsSplit => {
  const attacks: Attack[] = [];
  const nonAttackActions: SrdCreatureAction[] = [];
  for (const action of actions) {
    const parsed = parseCreatureAction(action.description);
    if (parsed.attackBonus === "" && parsed.damage === "") {
      nonAttackActions.push(action);
    } else {
      attacks.push({
        id: crypto.randomUUID(),
        name: action.name,
        ...parsed,
      });
    }
  }
  while (attacks.length < MIN_ATTACKS) {
    attacks.push(makeEmptyAttack());
  }
  return { attacks, nonAttackActions };
};
