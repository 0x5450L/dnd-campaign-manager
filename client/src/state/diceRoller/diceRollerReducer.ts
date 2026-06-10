import type { AdvDis, DiceHistoryEntry, RollResult } from "../../types/dice";

export type DiceRollerState = {
  isOpen: boolean;
  isRolling: boolean;
  formula: string;
  mode: AdvDis;
  lastResult: RollResult | null;
  history: DiceHistoryEntry[];
  error: string | null;
  sessionActive: boolean;
  shareToSession: boolean;
};

export const HISTORY_LIMIT = 30;

export type DiceRollerAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "TOGGLE" }
  | { type: "SET_FORMULA"; formula: string }
  | { type: "SET_MODE"; mode: AdvDis }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "START_ROLL" }
  | { type: "FINISH_ROLL"; result: RollResult }
  | { type: "CLEAR_HISTORY" }
  | { type: "REPLAY"; entry: DiceHistoryEntry }
  | { type: "HYDRATE"; history: DiceHistoryEntry[] }
  | { type: "SET_SESSION_ACTIVE"; active: boolean }
  | { type: "SET_SHARE_TO_SESSION"; enabled: boolean };

export const initialDiceRollerState: DiceRollerState = {
  isOpen: false,
  isRolling: false,
  formula: "1d20",
  mode: "normal",
  lastResult: null,
  history: [],
  error: null,
  sessionActive: false,
  shareToSession: false,
};

export const diceRollerReducer = (
  state: DiceRollerState,
  action: DiceRollerAction,
): DiceRollerState => {
  switch (action.type) {
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "TOGGLE":
      return { ...state, isOpen: !state.isOpen };
    case "SET_FORMULA":
      return { ...state, formula: action.formula, error: null };
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "START_ROLL":
      return { ...state, isRolling: true, error: null };
    case "FINISH_ROLL": {
      const nextHistory = [action.result, ...state.history].slice(0, HISTORY_LIMIT);
      return {
        ...state,
        isRolling: false,
        lastResult: action.result,
        history: nextHistory,
      };
    }
    case "REPLAY":
      return { ...state, lastResult: action.entry, isOpen: true };
    case "CLEAR_HISTORY":
      return { ...state, history: [] };
    case "HYDRATE":
      return { ...state, history: action.history };
    case "SET_SESSION_ACTIVE":
      return {
        ...state,
        sessionActive: action.active,
        shareToSession: action.active ? state.shareToSession : false,
      };
    case "SET_SHARE_TO_SESSION":
      return { ...state, shareToSession: action.enabled };
  }
};
