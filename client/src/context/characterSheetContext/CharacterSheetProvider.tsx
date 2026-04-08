import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  CharacterSheetContext,
  type AbilityName,
  type AbilityState,
  type Attack,
  type CharacterSheetContextType,
  type CharacterSheetState,
  type SkillDef,
  type UseHitDieResult,
} from "./CharacterSheetContext";

const DEFAULT_SKILLS: SkillDef[] = [
  { name: "Athletics", ability: "str", proficient: false },
  { name: "Acrobatics", ability: "dex", proficient: false },
  { name: "Sleight of Hand", ability: "dex", proficient: false },
  { name: "Stealth", ability: "dex", proficient: false },
  { name: "Arcana", ability: "int", proficient: false },
  { name: "History", ability: "int", proficient: false },
  { name: "Investigation", ability: "int", proficient: false },
  { name: "Nature", ability: "int", proficient: false },
  { name: "Religion", ability: "int", proficient: false },
  { name: "Animal Handling", ability: "wis", proficient: false },
  { name: "Insight", ability: "wis", proficient: false },
  { name: "Medicine", ability: "wis", proficient: false },
  { name: "Perception", ability: "wis", proficient: false },
  { name: "Survival", ability: "wis", proficient: false },
  { name: "Deception", ability: "cha", proficient: false },
  { name: "Intimidation", ability: "cha", proficient: false },
  { name: "Performance", ability: "cha", proficient: false },
  { name: "Persuasion", ability: "cha", proficient: false },
];

const DEFAULT_ABILITIES: Record<AbilityName, AbilityState> = {
  str: { score: 10, saveProficient: false },
  dex: { score: 10, saveProficient: false },
  con: { score: 10, saveProficient: false },
  int: { score: 10, saveProficient: false },
  wis: { score: 10, saveProficient: false },
  cha: { score: 10, saveProficient: false },
};

const INITIAL_STATE: CharacterSheetState = {
  name: "New Character",
  race: "",
  characterClass: "",
  level: 1,
  background: "",
  subclass: "",
  xp: 0,

  abilities: DEFAULT_ABILITIES,
  skills: DEFAULT_SKILLS,

  ac: 10,
  usesShield: false,
  speed: 30,
  size: "Medium",
  currentHp: 10,
  maxHp: 10,
  tempHp: 0,
  hitDiceType: "d8",
  hitDiceUsed: 0,
  deathSaveSuccesses: 0,
  deathSaveFailures: 0,
  inspiration: false,

  attacks: [],

  classFeatures: "",
  racialTraits: "",
  feats: "",

  armorProficiencies: "",
  weaponProficiencies: "",
  toolProficiencies: "",
};

const calcModifier = (score: number) => Math.floor((score - 10) / 2);
const diceSides = (type: string): number => Number(type.replace("d", "")) || 8;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type Props = { children: ReactNode; initialState?: Partial<CharacterSheetState> };

export const CharacterSheetProvider = ({ children, initialState }: Props) => {
  const [state, setState] = useState<CharacterSheetState>({
    ...INITIAL_STATE,
    ...initialState,
  });

  const setField = useCallback(
    <K extends keyof CharacterSheetState>(
      field: K,
      value: CharacterSheetState[K],
    ) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const setAbilityScore = useCallback((ability: AbilityName, score: number) => {
    setState((prev) => ({
      ...prev,
      abilities: {
        ...prev.abilities,
        [ability]: { ...prev.abilities[ability], score },
      },
    }));
  }, []);

  const setSaveProficient = useCallback(
    (ability: AbilityName, proficient: boolean) => {
      setState((prev) => ({
        ...prev,
        abilities: {
          ...prev.abilities,
          [ability]: { ...prev.abilities[ability], saveProficient: proficient },
        },
      }));
    },
    [],
  );

  const setSkillProficient = useCallback(
    (skillName: string, proficient: boolean) => {
      setState((prev) => ({
        ...prev,
        skills: prev.skills.map((s) =>
          s.name === skillName ? { ...s, proficient } : s,
        ),
      }));
    },
    [],
  );

  const toggleShield = useCallback(
    () => setState((prev) => ({ ...prev, usesShield: !prev.usesShield })),
    [],
  );
  const toggleInspiration = useCallback(
    () => setState((prev) => ({ ...prev, inspiration: !prev.inspiration })),
    [],
  );

  const addAttack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      attacks: [
        ...prev.attacks,
        {
          id: crypto.randomUUID(),
          name: "",
          attackBonus: "",
          damage: "",
          notes: "",
        },
      ],
    }));
  }, []);

  const updateAttack = useCallback(
    (id: string, field: keyof Attack, value: string) => {
      setState((prev) => ({
        ...prev,
        attacks: prev.attacks.map((a) =>
          a.id === id ? { ...a, [field]: value } : a,
        ),
      }));
    },
    [],
  );

  const removeAttack = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      attacks: prev.attacks.filter((a) => a.id !== id),
    }));
  }, []);

  const heal = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      currentHp: clamp(prev.currentHp + amount, 0, prev.maxHp),
    }));
  }, []);

  const damage = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState((prev) => {
      let remaining = amount;
      let temp = prev.tempHp;
      if (temp > 0) {
        const used = Math.min(temp, remaining);
        temp -= used;
        remaining -= used;
      }
      const current = Math.max(0, prev.currentHp - remaining);
      return { ...prev, currentHp: current, tempHp: temp };
    });
  }, []);

  const spendHitDie = useCallback((): UseHitDieResult => {
    let result: UseHitDieResult = null;
    setState((prev) => {
      const max = prev.level;
      const remaining = max - prev.hitDiceUsed;
      if (remaining <= 0) return prev;
      if (prev.currentHp >= prev.maxHp) return prev;

      const sides = diceSides(prev.hitDiceType);
      const rolled = Math.floor(Math.random() * sides) + 1;
      const conMod = calcModifier(prev.abilities.con.score);
      const healed = Math.max(1, rolled + conMod);
      const newCurrentHp = clamp(prev.currentHp + healed, 0, prev.maxHp);

      result = { rolled, conMod, healed, newCurrentHp };

      return {
        ...prev,
        currentHp: newCurrentHp,
        hitDiceUsed: prev.hitDiceUsed + 1,
      };
    });
    return result;
  }, []);

  const resetHitDice = useCallback(() => {
    setState((prev) => ({ ...prev, hitDiceUsed: 0 }));
  }, []);

  const longRest = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentHp: prev.maxHp,
      hitDiceUsed: 0,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
    }));
  }, []);

  const value = useMemo<CharacterSheetContextType>(() => {
    const proficiencyBonus = Math.ceil(state.level / 4) + 1;

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
    const passivePerception = 10 + (perception ? getSkillValue(perception) : 0);

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
}