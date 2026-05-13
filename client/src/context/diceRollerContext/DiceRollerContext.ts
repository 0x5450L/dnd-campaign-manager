import { createContext } from "react";
import type {
  AdvDis,
  DiceHistoryEntry,
  DiceType,
  RollResult,
} from "../../types/dice";

export type DiceRollerContextType = {
  isOpen: boolean;
  isRolling: boolean;
  formula: string;
  mode: AdvDis;
  lastResult: RollResult | null;
  history: DiceHistoryEntry[];
  error: string | null;

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
};

export const DiceRollerContext = createContext<DiceRollerContextType | null>(null);
