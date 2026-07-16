import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type DiceRollerAction,
  type DiceRollerState,
  diceRollerReducer,
  initialDiceRollerState,
} from "./diceRollerReducer";
import {
  DiceParseError,
  addDieToFormula,
  applyAdvDis,
  formatTerms,
  parseDiceFormula,
  rollTerms,
} from "@/utils/diceParser";
import type { AdvDis, DiceHistoryEntry, DiceType, RollResult } from "@/types/dice";

type DiceSessionSink = (result: RollResult) => void;

type DiceRollerActions = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setFormula: (formula: string) => void;
  setMode: (mode: AdvDis) => void;
  addDie: (type: DiceType) => void;
  clearFormula: () => void;
  roll: (label?: string) => void;
  rerollFromHistory: (entry: DiceHistoryEntry) => void;
  showHistoryResult: (entry: DiceHistoryEntry) => void;
  clearHistory: () => void;
  setShareToSession: (enabled: boolean) => void;
  registerSessionSink: (sink: DiceSessionSink | null) => void;
};

export type DiceRollerStore = DiceRollerState & DiceRollerActions;

const HISTORY_STORAGE_KEY = "dnd-dice-history-v1";
const ROLL_ANIMATION_MS = 750;

let rollTimer: number | null = null;
let sessionSink: DiceSessionSink | null = null;

export const useDiceRollerStore = create<DiceRollerStore>()(
  persist(
    (set, get) => {
      const dispatch = (action: DiceRollerAction) =>
        set((state) => diceRollerReducer(state, action));

      const runRoll = (formula: string, opts: { label?: string; mode?: AdvDis } = {}) => {
        try {
          const parsed = parseDiceFormula(formula);
          const adjusted = applyAdvDis(parsed, opts.mode ?? "normal");
          const normalized = formatTerms(adjusted);

          if (rollTimer !== null) {
            window.clearTimeout(rollTimer);
          }
          dispatch({ type: "START_ROLL" });

          rollTimer = window.setTimeout(() => {
            const result = rollTerms(adjusted, normalized, opts.label);
            dispatch({ type: "FINISH_ROLL", result });
            if (get().shareToSession && sessionSink) {
              sessionSink(result);
            }
            rollTimer = null;
          }, ROLL_ANIMATION_MS);
        } catch (e) {
          const message = e instanceof DiceParseError ? e.message : "Cannot parse formula";
          dispatch({ type: "SET_ERROR", error: message });
        }
      };

      return {
        ...initialDiceRollerState,

        open: () => dispatch({ type: "OPEN" }),
        close: () => dispatch({ type: "CLOSE" }),
        toggle: () => dispatch({ type: "TOGGLE" }),
        setFormula: (formula) => dispatch({ type: "SET_FORMULA", formula }),
        setMode: (mode) => dispatch({ type: "SET_MODE", mode }),
        addDie: (type) =>
          dispatch({ type: "SET_FORMULA", formula: addDieToFormula(get().formula, type) }),
        clearFormula: () => dispatch({ type: "SET_FORMULA", formula: "" }),
        roll: (label) => runRoll(get().formula, { label, mode: get().mode }),
        rerollFromHistory: (entry) =>
          runRoll(entry.expression, { label: entry.label, mode: "normal" }),
        showHistoryResult: (entry) => dispatch({ type: "REPLAY", entry }),
        clearHistory: () => dispatch({ type: "CLEAR_HISTORY" }),
        setShareToSession: (enabled) => dispatch({ type: "SET_SHARE_TO_SESSION", enabled }),
        registerSessionSink: (sink) => {
          sessionSink = sink;
          dispatch({ type: "SET_SESSION_ACTIVE", active: sink !== null });
        },
      };
    },
    {
      name: HISTORY_STORAGE_KEY,
      partialize: (state) => ({ history: state.history }),
    },
  ),
);
