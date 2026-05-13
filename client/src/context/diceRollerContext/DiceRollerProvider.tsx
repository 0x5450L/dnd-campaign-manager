import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  DiceRollerContext,
  type DiceRollerContextType,
} from "./DiceRollerContext";
import {
  diceRollerReducer,
  initialDiceRollerState,
} from "../../state/diceRoller/diceRollerReducer";
import {
  DiceParseError,
  addDieToFormula,
  applyAdvDis,
  formatTerms,
  parseDiceFormula,
  rollTerms,
} from "../../utils/diceParser";
import type { AdvDis, DiceHistoryEntry, DiceType } from "../../types/dice";

type Props = {
  children: ReactNode;
};

const HISTORY_STORAGE_KEY = "dnd-dice-history-v1";
const ROLL_ANIMATION_MS = 750;

const loadHistory = (): DiceHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DiceHistoryEntry[];
  } catch {
    return [];
  }
};

export const DiceRollerProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(diceRollerReducer, initialDiceRollerState);
  const rollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const history = loadHistory();
    if (history.length > 0) dispatch({ type: "HYDRATE", history });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state.history));
    } catch {
      void 0;
    }
  }, [state.history]);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current !== null) {
        window.clearTimeout(rollTimerRef.current);
      }
    };
  }, []);

  const open = useCallback(() => dispatch({ type: "OPEN" }), []);
  const close = useCallback(() => dispatch({ type: "CLOSE" }), []);
  const toggle = useCallback(() => dispatch({ type: "TOGGLE" }), []);

  const setFormula = useCallback(
    (formula: string) => dispatch({ type: "SET_FORMULA", formula }),
    [],
  );
  const setMode = useCallback(
    (mode: AdvDis) => dispatch({ type: "SET_MODE", mode }),
    [],
  );

  const addDie = useCallback(
    (type: DiceType) => {
      const next = addDieToFormula(state.formula, type);
      dispatch({ type: "SET_FORMULA", formula: next });
    },
    [state.formula],
  );

  const clearFormula = useCallback(
    () => dispatch({ type: "SET_FORMULA", formula: "" }),
    [],
  );

  const runRoll = useCallback(
    (formula: string, opts: { label?: string; mode?: AdvDis } = {}) => {
      try {
        const parsed = parseDiceFormula(formula);
        const adjusted = applyAdvDis(parsed, opts.mode ?? "normal");
        const normalized = formatTerms(adjusted);

        if (rollTimerRef.current !== null) {
          window.clearTimeout(rollTimerRef.current);
        }
        dispatch({ type: "START_ROLL" });

        rollTimerRef.current = window.setTimeout(() => {
          const result = rollTerms(adjusted, normalized, opts.label);
          dispatch({ type: "FINISH_ROLL", result });
          rollTimerRef.current = null;
        }, ROLL_ANIMATION_MS);
      } catch (e) {
        const message =
          e instanceof DiceParseError ? e.message : "Cannot parse formula";
        dispatch({ type: "SET_ERROR", error: message });
      }
    },
    [],
  );

  const roll = useCallback(
    (label?: string) => {
      runRoll(state.formula, { label, mode: state.mode });
    },
    [runRoll, state.formula, state.mode],
  );

  const rerollFromHistory = useCallback(
    (entry: DiceHistoryEntry) => {
      runRoll(entry.expression, { label: entry.label, mode: "normal" });
    },
    [runRoll],
  );

  const showHistoryResult = useCallback((entry: DiceHistoryEntry) => {
    dispatch({ type: "REPLAY", entry });
  }, []);

  const clearHistory = useCallback(() => dispatch({ type: "CLEAR_HISTORY" }), []);

  const value = useMemo<DiceRollerContextType>(
    () => ({
      isOpen: state.isOpen,
      isRolling: state.isRolling,
      formula: state.formula,
      mode: state.mode,
      lastResult: state.lastResult,
      history: state.history,
      error: state.error,

      open,
      close,
      toggle,
      setFormula,
      setMode,
      addDie,
      clearFormula,
      roll,
      rerollFromHistory,
      showHistoryResult,
      clearHistory,
    }),
    [
      state,
      open,
      close,
      toggle,
      setFormula,
      setMode,
      addDie,
      clearFormula,
      roll,
      rerollFromHistory,
      showHistoryResult,
      clearHistory,
    ],
  );

  return (
    <DiceRollerContext.Provider value={value}>
      {children}
    </DiceRollerContext.Provider>
  );
};
