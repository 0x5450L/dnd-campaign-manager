import { clamp } from "../../utils/dndMath";
import type {
  AbilityName,
  Attack,
  CharacterSheetState,
} from "../../types/characters/characterSheet";

export type CharacterSheetAction =
  | { type: "SET_FIELD"; payload: Partial<CharacterSheetState> }
  | { type: "SET_ABILITY_SCORE"; ability: AbilityName; score: number }
  | { type: "SET_SAVE_PROFICIENT"; ability: AbilityName; proficient: boolean }
  | { type: "SET_SKILL_PROFICIENT"; skillName: string; proficient: boolean }
  | { type: "TOGGLE_SHIELD" }
  | { type: "TOGGLE_INSPIRATION" }
  | { type: "ADD_ATTACK"; attack: Attack }
  | { type: "UPDATE_ATTACK"; id: string; field: keyof Attack; value: string }
  | { type: "REMOVE_ATTACK"; id: string }
  | { type: "HEAL"; amount: number }
  | { type: "DAMAGE"; amount: number }
  | { type: "APPLY_HIT_DIE"; newCurrentHp: number }
  | { type: "RESET_HIT_DICE" }
  | { type: "LONG_REST" };

export const characterSheetReducer = (
  state: CharacterSheetState,
  action: CharacterSheetAction,
): CharacterSheetState => {
  switch (action.type) {
    case "SET_FIELD":
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

    case "TOGGLE_INSPIRATION":
      return { ...state, inspiration: !state.inspiration };

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
