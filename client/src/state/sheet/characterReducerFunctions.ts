import type {
  CharacterSheetFields,
  CharacterSheetState,
} from "@/types/characters/characterSheet";

export type CharacterSheetAction =
  | { type: "SET_CHARACTER_FIELD"; payload: Partial<CharacterSheetFields> }
  | { type: "SET_LEVEL_AND_XP"; level: number; xp: number }
  | { type: "TOGGLE_INSPIRATION" }
  | { type: "APPLY_HIT_DIE"; newCurrentHp: number }
  | { type: "RESET_HIT_DICE" }
  | { type: "LONG_REST" };

const CHARACTER_ACTION_TYPES: ReadonlySet<string> = new Set<
  CharacterSheetAction["type"]
>([
  "SET_CHARACTER_FIELD",
  "SET_LEVEL_AND_XP",
  "TOGGLE_INSPIRATION",
  "APPLY_HIT_DIE",
  "RESET_HIT_DICE",
  "LONG_REST",
]);

export const isCharacterSheetAction = (action: {
  type: string;
}): action is CharacterSheetAction => CHARACTER_ACTION_TYPES.has(action.type);

export const applyCharacterAction = (
  state: CharacterSheetState,
  action: CharacterSheetAction,
): CharacterSheetState => {
  switch (action.type) {
    case "SET_CHARACTER_FIELD":
      return { ...state, ...action.payload };

    case "SET_LEVEL_AND_XP":
      return { ...state, level: action.level, xp: action.xp };

    case "TOGGLE_INSPIRATION":
      return { ...state, inspiration: !state.inspiration };

    case "APPLY_HIT_DIE":
      return {
        ...state,
        currentHp: action.newCurrentHp,
        hitDiceUsed: state.hitDiceUsed + 1,
      };

    case "RESET_HIT_DICE":
      return { ...state, hitDiceUsed: 0 };

    case "LONG_REST":
      return {
        ...state,
        currentHp: state.maxHp,
        hitDiceUsed: 0,
        deathSaveSuccesses: 0,
        deathSaveFailures: 0,
      };
  }
};
