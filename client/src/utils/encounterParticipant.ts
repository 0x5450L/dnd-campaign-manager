import { clamp } from "./dndMath";

type HpState = {
  currentHp: number;
  maxHp: number;
  tempHp: number;
};

type DeathSaveState = {
  deathSaveSuccesses: number;
  deathSaveFailures: number;
};

const MAX_DEATH_SAVES = 3;

export const applyDamage = (hp: HpState, amount: number): HpState => {
  const damage = Math.max(0, amount);
  const absorbedByTemp = Math.min(damage, hp.tempHp);
  return {
    ...hp,
    tempHp: hp.tempHp - absorbedByTemp,
    currentHp: clamp(hp.currentHp - (damage - absorbedByTemp), 0, hp.maxHp),
  };
};

export const applyHealing = (hp: HpState, amount: number): HpState => ({
  ...hp,
  currentHp: clamp(hp.currentHp + Math.max(0, amount), 0, hp.maxHp),
});

export const applyTempHp = (hp: HpState, amount: number): HpState => ({
  ...hp,
  tempHp: Math.max(hp.tempHp, Math.max(0, amount)),
});

export const toggleConditionInList = (
  conditions: string[],
  condition: string,
): string[] =>
  conditions.includes(condition)
    ? conditions.filter((c) => c !== condition)
    : [...conditions, condition];

export const incrementDeathSave = (
  saves: DeathSaveState,
  outcome: "success" | "failure",
): DeathSaveState => ({
  deathSaveSuccesses:
    outcome === "success"
      ? Math.min(MAX_DEATH_SAVES, saves.deathSaveSuccesses + 1)
      : saves.deathSaveSuccesses,
  deathSaveFailures:
    outcome === "failure"
      ? Math.min(MAX_DEATH_SAVES, saves.deathSaveFailures + 1)
      : saves.deathSaveFailures,
});
