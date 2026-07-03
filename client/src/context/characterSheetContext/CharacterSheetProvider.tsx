import {
  useCallback,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  CharacterSheetContext,
  type CharacterSheetContextType,
} from "./CharacterSheetContext";
import { characterSheetReducer } from "./characterSheetReducer";
import type {
  AbilityName,
  Attack,
  CharacterSheetState,
  SkillDef,
  UseHitDieResult,
} from "../../types/characters/characterSheet";
import {
  calcModifier,
  clamp,
  getLevelFromXp,
  getProficiencyBonus,
  getXpFromLevel,
  MAX_LEVEL,
  MIN_LEVEL,
  parseDiceToSidesNumber,
} from "../../utils/dndMath";
import { createInitialCharacterSheet } from "../../constants/characterSheet";
import { sheetStateToUpdatePayload } from "../../utils/characterSheetMapping";

type Props = {
  children: ReactNode;
  initialState?: Partial<CharacterSheetState>;
  serverState?: Partial<CharacterSheetState>;
};

const serverFingerprint = (partial: Partial<CharacterSheetState>): string =>
  JSON.stringify(
    sheetStateToUpdatePayload({ ...createInitialCharacterSheet(), ...partial }, "monster"),
  );

const buildInitialState = (
  overrides?: Partial<CharacterSheetState>,
): CharacterSheetState => ({
  ...createInitialCharacterSheet(),
  ...overrides,
});

export const CharacterSheetProvider = ({ children, initialState, serverState }: Props) => {
  const [state, dispatch] = useReducer(
    characterSheetReducer,
    initialState,
    buildInitialState,
  );

  const [serverBaseline, setServerBaseline] = useState<string | null>(null);
  if (serverState) {
    const incoming = serverFingerprint(serverState);
    if (incoming !== serverBaseline) {
      const current = serverFingerprint(state);
      const sheetIsClean = serverBaseline === null || current === serverBaseline;
      if (sheetIsClean || current === incoming) {
        if (current !== incoming) {
          dispatch({ type: "SET_FIELD", payload: serverState });
        }
        setServerBaseline(incoming);
      }
    }
  }

  const setField = useCallback(
    <K extends keyof CharacterSheetState>(
      field: K,
      value: CharacterSheetState[K],
    ) => {
      dispatch({
        type: "SET_FIELD",
        payload: { [field]: value } as Partial<CharacterSheetState>,
      });
    },
    [],
  );

  const setLevelFromXp = useCallback((xp: number) => {
    const safeXp = Math.max(0, xp);
    dispatch({
      type: "SET_FIELD",
      payload: { xp: safeXp, level: getLevelFromXp(safeXp) },
    });
  }, []);

  const setXpFromLevel = useCallback((level: number) => {
    const safeLevel = clamp(level, MIN_LEVEL, MAX_LEVEL);
    dispatch({
      type: "SET_FIELD",
      payload: { level: safeLevel, xp: getXpFromLevel(safeLevel) },
    });
  }, []);

  const setAbilityScore = useCallback(
    (ability: AbilityName, score: number) =>
      dispatch({ type: "SET_ABILITY_SCORE", ability, score }),
    [],
  );

  const setSaveProficient = useCallback(
    (ability: AbilityName, proficient: boolean) =>
      dispatch({ type: "SET_SAVE_PROFICIENT", ability, proficient }),
    [],
  );

  const setSkillProficient = useCallback(
    (skillName: string, proficient: boolean) =>
      dispatch({ type: "SET_SKILL_PROFICIENT", skillName, proficient }),
    [],
  );

  const toggleShield = useCallback(
    () => dispatch({ type: "TOGGLE_SHIELD" }),
    [],
  );

  const toggleInspiration = useCallback(
    () => dispatch({ type: "TOGGLE_INSPIRATION" }),
    [],
  );

  const addAttack = useCallback(() => {
    dispatch({
      type: "ADD_ATTACK",
      attack: {
        id: crypto.randomUUID(),
        name: "",
        attackBonus: "",
        damage: "",
        notes: "",
      },
    });
  }, []);

  const updateAttack = useCallback(
    (id: string, field: keyof Attack, value: string) =>
      dispatch({ type: "UPDATE_ATTACK", id, field, value }),
    [],
  );

  const removeAttack = useCallback(
    (id: string) => dispatch({ type: "REMOVE_ATTACK", id }),
    [],
  );

  const heal = useCallback(
    (amount: number) => dispatch({ type: "HEAL", amount }),
    [],
  );

  const damage = useCallback(
    (amount: number) => dispatch({ type: "DAMAGE", amount }),
    [],
  );

  const spendHitDie = useCallback((): UseHitDieResult => {
    const remaining = state.level - state.hitDiceUsed;
    if (remaining <= 0) return null;
    if (state.currentHp >= state.maxHp) return null;

    const sides = parseDiceToSidesNumber(state.hitDiceType);
    const rolled = Math.floor(Math.random() * sides) + 1;
    const conMod = calcModifier(state.abilities.con.score);
    const healed = Math.max(1, rolled + conMod);
    const newCurrentHp = clamp(state.currentHp + healed, 0, state.maxHp);

    dispatch({ type: "APPLY_HIT_DIE", newCurrentHp });
    return { rolled, conMod, healed, newCurrentHp };
  }, [state]);

  const resetHitDice = useCallback(
    () => dispatch({ type: "RESET_HIT_DICE" }),
    [],
  );

  const longRest = useCallback(() => dispatch({ type: "LONG_REST" }), []);

  const value = useMemo<CharacterSheetContextType>(() => {
    const proficiencyBonus = getProficiencyBonus(state.level);

    const getModifier = (ability: AbilityName) =>
      calcModifier(state.abilities[ability].score);

    const getSaveValue = (ability: AbilityName) => {
      const mod = getModifier(ability);
      return state.abilities[ability].saveProficient
        ? mod + proficiencyBonus
        : mod;
    };

    const getSkillValue = (skill: SkillDef) => {
      const mod = getModifier(skill.ability);
      return skill.proficient ? mod + proficiencyBonus : mod;
    };

    const getSkillsForAbility = (ability: AbilityName) =>
      state.skills
        .filter((s) => s.ability === ability)
        .map((s) => ({
          name: s.name,
          proficient: s.proficient,
          value: getSkillValue(s),
        }));

    const perception = state.skills.find((s) => s.name === "Perception");
    const passivePerception =
      10 + (perception ? getSkillValue(perception) : 0);

    return {
      state,
      proficiencyBonus,
      getModifier,
      getSaveValue,
      getSkillValue,
      getSkillsForAbility,
      initiative: getModifier("dex"),
      passivePerception,
      conMod: getModifier("con"),
      hitDiceMax: state.level,
      hitDiceRemaining: Math.max(0, state.level - state.hitDiceUsed),

      setField,
      setLevelFromXp,
      setXpFromLevel,
      setAbilityScore,
      setSaveProficient,
      setSkillProficient,
      toggleShield,
      toggleInspiration,
      addAttack,
      updateAttack,
      removeAttack,
      heal,
      damage,
      spendHitDie,
      resetHitDice,
      longRest,
    };
  }, [
    state,
    setField,
    setLevelFromXp,
    setXpFromLevel,
    setAbilityScore,
    setSaveProficient,
    setSkillProficient,
    toggleShield,
    toggleInspiration,
    addAttack,
    updateAttack,
    removeAttack,
    heal,
    damage,
    spendHitDie,
    resetHitDice,
    longRest,
  ]);

  return (
    <CharacterSheetContext.Provider value={value}>
      {children}
    </CharacterSheetContext.Provider>
  );
};
