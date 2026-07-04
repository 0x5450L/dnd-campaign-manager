import { clamp } from "../../utils/dndMath";
import type {
  AbilityName,
  Attack,
  SharedSheetFields,
  SheetState,
} from "../../types/characters/characterSheet";

export type SharedSheetAction =
  | { type: "SET_SHARED_FIELD"; payload: Partial<SharedSheetFields> }
  | { type: "SET_ABILITY_SCORE"; ability: AbilityName; score: number }
  | { type: "SET_SAVE_PROFICIENT"; ability: AbilityName; proficient: boolean }
  | { type: "SET_SKILL_PROFICIENT"; skillName: string; proficient: boolean }
  | { type: "TOGGLE_SHIELD" }
  | { type: "ADD_ATTACK"; attack: Attack }
  | { type: "UPDATE_ATTACK"; id: string; field: keyof Attack; value: string }
  | { type: "REMOVE_ATTACK"; id: string }
  | { type: "HEAL"; amount: number }
  | { type: "DAMAGE"; amount: number };

const SHARED_ACTION_TYPES: ReadonlySet<string> = new Set<
  SharedSheetAction["type"]
>([
  "SET_SHARED_FIELD",
  "SET_ABILITY_SCORE",
  "SET_SAVE_PROFICIENT",
  "SET_SKILL_PROFICIENT",
  "TOGGLE_SHIELD",
  "ADD_ATTACK",
  "UPDATE_ATTACK",
  "REMOVE_ATTACK",
  "HEAL",
  "DAMAGE",
]);

export const isSharedSheetAction = (action: {
  type: string;
}): action is SharedSheetAction => SHARED_ACTION_TYPES.has(action.type);

export const applySharedAction = (
  state: SheetState,
  action: SharedSheetAction,
): SheetState => {
  switch (action.type) {
    case "SET_SHARED_FIELD":
      return { ...state, ...action.payload };

    case "SET_ABILITY_SCORE":
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.ability]: {
            ...state.abilities[action.ability],
            score: action.score,
          },
        },
      };

    case "SET_SAVE_PROFICIENT":
      return {
        ...state,
        abilities: {
          ...state.abilities,
          [action.ability]: {
            ...state.abilities[action.ability],
            saveProficient: action.proficient,
          },
        },
      };

    case "SET_SKILL_PROFICIENT":
      return {
        ...state,
        skills: state.skills.map((s) =>
          s.name === action.skillName
            ? { ...s, proficient: action.proficient }
            : s,
        ),
      };

    case "TOGGLE_SHIELD":
      return { ...state, usesShield: !state.usesShield };

    case "ADD_ATTACK":
      return { ...state, attacks: [...state.attacks, action.attack] };

    case "UPDATE_ATTACK":
      return {
        ...state,
        attacks: state.attacks.map((a) =>
          a.id === action.id ? { ...a, [action.field]: action.value } : a,
        ),
      };

    case "REMOVE_ATTACK":
      return {
        ...state,
        attacks: state.attacks.filter((a) => a.id !== action.id),
      };

    case "HEAL": {
      if (action.amount <= 0) return state;
      return {
        ...state,
        currentHp: clamp(state.currentHp + action.amount, 0, state.maxHp),
      };
    }

    case "DAMAGE": {
      if (action.amount <= 0) return state;
      let remaining = action.amount;
      let temp = state.tempHp;
      if (temp > 0) {
        const used = Math.min(temp, remaining);
        temp -= used;
        remaining -= used;
      }
      const current = Math.max(0, state.currentHp - remaining);
      return { ...state, currentHp: current, tempHp: temp };
    }
  }
};
