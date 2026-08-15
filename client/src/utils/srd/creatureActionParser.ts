import type { SrdCreatureAction } from "@dnd/shared/dto/srd";
import { parseCreatureAction } from "@dnd/shared/utils/srd/creatureActionParser";
import { MIN_ATTACKS } from "@/constants/characterSheet";
import type { Attack } from "@/types/characters/characterSheet";

export { parseCreatureAction };

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
