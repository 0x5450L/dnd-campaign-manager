import { create } from "zustand";
import { sheetReducer, type SheetAction } from "./sheetReducer";
import { getHitDiceRemaining } from "./sheetDerived";
import { createInitialCharacterSheet } from "../../constants/characterSheet";
import { sheetStateToUpdatePayload } from "../../utils/characterSheetMapping";
import {
  calcModifier,
  clamp,
  getLevelFromXp,
  getXpFromLevel,
  MAX_LEVEL,
  MIN_LEVEL,
  parseDiceToSidesNumber,
} from "../../utils/dndMath";
import type {
  AbilityName,
  Attack,
  CharacterSheetFields,
  CreatureSheetFields,
  SharedSheetFields,
  SheetState,
  UseHitDieResult,
} from "../../types/characters/characterSheet";

export type SheetActions = {
  openSheet: (
    sheetId: string,
    state: SheetState,
    hasServerBaseline: boolean,
  ) => void;
  closeSheet: () => void;

  setSharedField: <K extends keyof SharedSheetFields>(
    field: K,
    value: SharedSheetFields[K],
  ) => void;
  setCharacterField: <K extends keyof CharacterSheetFields>(
    field: K,
    value: CharacterSheetFields[K],
  ) => void;
  setCreatureField: <K extends keyof CreatureSheetFields>(
    field: K,
    value: CreatureSheetFields[K],
  ) => void;

  setLevelFromXp: (xp: number) => void;
  setXpFromLevel: (level: number) => void;

  setAbilityScore: (ability: AbilityName, score: number) => void;
  setSaveProficient: (ability: AbilityName, proficient: boolean) => void;
  setSkillProficient: (skillName: string, proficient: boolean) => void;

  toggleShield: () => void;
  toggleInspiration: () => void;

  addAttack: () => void;
  updateAttack: (id: string, field: keyof Attack, value: string) => void;
  removeAttack: (id: string) => void;

  heal: (amount: number) => void;
  damage: (amount: number) => void;
  spendHitDie: () => UseHitDieResult;
  resetHitDice: () => void;
  longRest: () => void;
};

export type SheetStore = {
  sheetId: string | null;
  state: SheetState;
  serverBaseline: string | null;
  actions: SheetActions;
};

const fingerprint = (state: SheetState): string =>
  JSON.stringify(sheetStateToUpdatePayload(state));

export const useSheetStore = create<SheetStore>()((set, get) => {
  const dispatch = (action: SheetAction) =>
    set((store) => ({ state: sheetReducer(store.state, action) }));

  const applyServerState = (server: SheetState) => {
    const incoming = fingerprint(server);
    const { state, serverBaseline } = get();
    if (incoming === serverBaseline) return;

    const current = fingerprint(state);
    const sheetIsClean = serverBaseline === null || current === serverBaseline;
    if (!sheetIsClean && current !== incoming) return;

    if (current !== incoming) {
      set({ state: server, serverBaseline: incoming });
    } else {
      set({ serverBaseline: incoming });
    }
  };

  return {
    sheetId: null,
    state: createInitialCharacterSheet(),
    serverBaseline: null,

    actions: {
      openSheet: (sheetId, state, hasServerBaseline) => {
        if (get().sheetId !== sheetId) {
          set({
            sheetId,
            state,
            serverBaseline: hasServerBaseline ? fingerprint(state) : null,
          });
          return;
        }
        if (hasServerBaseline) {
          applyServerState(state);
        }
      },

      closeSheet: () => set({ sheetId: null, serverBaseline: null }),

      setSharedField: (field, value) =>
        dispatch({ type: "SET_SHARED_FIELD", payload: { [field]: value } }),

      setCharacterField: (field, value) =>
        dispatch({ type: "SET_CHARACTER_FIELD", payload: { [field]: value } }),

      setCreatureField: (field, value) =>
        dispatch({ type: "SET_CREATURE_FIELD", payload: { [field]: value } }),

      setLevelFromXp: (xp) => {
        const safeXp = Math.max(0, xp);
        dispatch({
          type: "SET_LEVEL_AND_XP",
          level: getLevelFromXp(safeXp),
          xp: safeXp,
        });
      },

      setXpFromLevel: (level) => {
        const safeLevel = clamp(level, MIN_LEVEL, MAX_LEVEL);
        dispatch({
          type: "SET_LEVEL_AND_XP",
          level: safeLevel,
          xp: getXpFromLevel(safeLevel),
        });
      },

      setAbilityScore: (ability, score) =>
        dispatch({ type: "SET_ABILITY_SCORE", ability, score }),

      setSaveProficient: (ability, proficient) =>
        dispatch({ type: "SET_SAVE_PROFICIENT", ability, proficient }),

      setSkillProficient: (skillName, proficient) =>
        dispatch({ type: "SET_SKILL_PROFICIENT", skillName, proficient }),

      toggleShield: () => dispatch({ type: "TOGGLE_SHIELD" }),

      toggleInspiration: () => dispatch({ type: "TOGGLE_INSPIRATION" }),

      addAttack: () =>
        dispatch({
          type: "ADD_ATTACK",
          attack: {
            id: crypto.randomUUID(),
            name: "",
            attackBonus: "",
            damage: "",
            notes: "",
          },
        }),

      updateAttack: (id, field, value) =>
        dispatch({ type: "UPDATE_ATTACK", id, field, value }),

      removeAttack: (id) => dispatch({ type: "REMOVE_ATTACK", id }),

      heal: (amount) => dispatch({ type: "HEAL", amount }),

      damage: (amount) => dispatch({ type: "DAMAGE", amount }),

      spendHitDie: () => {
        const { state } = get();
        if (state.kind !== "character") return null;
        if (getHitDiceRemaining(state) <= 0) return null;
        if (state.currentHp >= state.maxHp) return null;

        const sides = parseDiceToSidesNumber(state.hitDiceType);
        const rolled = Math.floor(Math.random() * sides) + 1;
        const conMod = calcModifier(state.abilities.con.score);
        const healed = Math.max(1, rolled + conMod);
        const newCurrentHp = clamp(state.currentHp + healed, 0, state.maxHp);

        dispatch({ type: "APPLY_HIT_DIE", newCurrentHp });
        return { rolled, conMod, healed, newCurrentHp };
      },

      resetHitDice: () => dispatch({ type: "RESET_HIT_DICE" }),

      longRest: () => dispatch({ type: "LONG_REST" }),
    },
  };
});
